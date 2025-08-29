using System.ComponentModel.DataAnnotations;
using System.Net.Http.Headers;
using System.Text;
using Domination.Entities;
using Domination.Structures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Minio;
using Minio.DataModel;
using Minio.DataModel.Args;

namespace Domination.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly ILogger<PostsController> _logger;
    private readonly HololiveDbContext _db;
    private readonly IMinioClient _minio;
    private readonly UserManager<User> _userManager;
    private readonly IMemoryCache _cache;

    public PostsController(ILogger<PostsController> logger,
        HololiveDbContext db,
        IMinioClient minio,
        UserManager<User> userManager,
        IMemoryCache cache)
    {
        this._logger = logger;
        this._db = db;
        this._minio = minio;
        this._userManager = userManager;
        this._cache = cache;
    }

    [HttpGet]
    public async Task<IActionResult> GetPostsAsync([FromQuery(Name = "tags")] string? tagsStr,
        [FromQuery] [Range(0, int.MaxValue)] int page = 0,
        [FromQuery] bool keepLewd = true,
        CancellationToken ct = default)
    {
        List<Post> posts;
        int itemCount;
        if (!string.IsNullOrWhiteSpace(tagsStr))
        {
            string[] tags = tagsStr.Split(' ');

            posts = await this._db.Posts
                .Include(p => p.Tags)
                .ThenInclude(tl => tl.Tag)
                .Where(p => p.Tags.Count(pt => tags.Any(t => t == pt.Tag.Id)) == tags.Length)
                .Where(p => keepLewd || !p.IsLewd)
                .OrderByDescending(p => p.CreatedAt)
                .Skip(10 * page)
                .Take(10)
                .ToListAsync(ct);
            itemCount = await this._cache.GetOrCreateAsync(
                $"posts:pages:{tagsStr}{(keepLewd ? ":isLewd" : "")}",
                (e) =>
                {
                    e.AbsoluteExpiration = DateTimeOffset.Now + TimeSpan.FromMinutes(15);
                    return this._db.Posts
                        .Where(p =>
                            p.Tags.Count(pt => tags.Any(t => t == pt.Tag.Id)) == tags.Length)
                        .Where(p => keepLewd || !p.IsLewd)
                        .CountAsync(ct);
                });
        }
        else
        {
            posts = await this._db.Posts
                .Include(p => p.Tags)
                .ThenInclude(tl => tl.Tag)
                .OrderByDescending(p => p.CreatedAt)
                .Where(p => keepLewd || !p.IsLewd)
                .Skip(10 * page)
                .Take(10)
                .ToListAsync(ct);
            itemCount = await this._cache.GetOrCreateAsync(
                $"posts:pages{(keepLewd ? ":isLewd" : "")}",
                (e) =>
                {
                    e.AbsoluteExpiration = DateTimeOffset.Now + TimeSpan.FromMinutes(15);
                    return this._db.Posts.Where(p => keepLewd || !p.IsLewd).CountAsync(ct);
                });
        }

        List<PostResponse> responses = new(posts.Count);
        foreach (Post post in posts)
        {
            PostResponse formattedPost = new()
            {
                Id = post.Id,
                Author = post.Author,
                Tags = new List<string>(post.Tags.Count),
                IsLewd = post.IsLewd,
                CreatedAt = post.CreatedAt.ToUnixTimeMilliseconds(),
                Url = post.Service switch
                {
                    PostService.Twitter => $"https://twitter.com/{post.Author}/status/{post.Id}",
                    PostService.Pixiv => $"https://pixiv.net/en/artworks/{post.Id}",
                    _ => throw new ArgumentOutOfRangeException()
                },
            };
            foreach (TagLink postTag in post.Tags)
            {
                formattedPost.Tags.Add(postTag.Tag.Id);
            }

            responses.Add(formattedPost);
        }

        return Ok(new PostsResponse
        {
            Posts = responses,
            PageCount = itemCount / 10 + 1,
        });
    }

    [HttpPost]
    [Authorize(Roles = "Uploader, Staff, Admin")]
    public async Task<IActionResult> UploadAsync([FromForm] IFormFile file,
        [FromForm] string tags,
        [FromForm] string author,
        [FromForm] string id,
        [FromForm] bool isLewd,
        [FromForm] string service,
        CancellationToken ct = default)
    {
        if (!Enum.TryParse(service, out PostService serviceType))
        {
            return BadRequest("Invalid service type");
        }

        // ReSharper disable once MethodSupportsCancellation It does indeed not support it :blehh:
        if (await this._db.Posts.FindAsync(id) is not null)
        {
            return Conflict();
        }

        Post post = new()
        {
            Id = id,
            Author = author,
            IsLewd = isLewd,
            Service = serviceType,
        };
        this._db.Posts.Add(post);

        string[] tagSplit = tags.Split();
        List<Tag> dbTags
            = await this._db.Tags.Where(t => tagSplit.Any(a => a == t.Id))
                .ToListAsync(cancellationToken: ct);

        foreach (string tag in tagSplit)
        {
            if (string.IsNullOrWhiteSpace(tag))
            {
                continue;
            }

            Tag? dbTag = null;
            foreach (Tag t in dbTags)
            {
                if (t.Id == tag)
                {
                    dbTag = t;
                    break;
                }
            }

            if (dbTag is null)
            {
                dbTag = new Tag()
                {
                    Id = tag
                };
                this._db.Tags.Add(dbTag);
            }

            TagLink tagLink = new()
            {
                Post = post,
                Tag = dbTag,
            };
            this._db.TagLinks.Add(tagLink);
        }

        await using Stream fileStream = file.OpenReadStream();

        PutObjectArgs putObject = new PutObjectArgs()
            .WithStreamData(file.OpenReadStream())
            .WithObjectSize(file.Length)
            .WithBucket("posts")
            .WithObject(id)
            .WithContentType(file.ContentType);

        fileStream.Position = 0;
        await this._minio.PutObjectAsync(putObject, ct);

        this._db.Logs.Add(new Log
        {
            Id = Guid.NewGuid(),
            ById = Guid.Parse(this._userManager.GetUserId(this.User) ?? ""),
            Towards = id,
            Description = "Created post"
        });

        await this._db.SaveChangesAsync(ct);

        return Created();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostAsync(string id, CancellationToken ct = default)
    {
        Post? post = await this._db.Posts
            .Include(p => p.Tags)
            .ThenInclude(tl => tl.Tag)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (post is null)
        {
            return NotFound();
        }

        PostResponse response = new()
        {
            Id = post.Id,
            Author = post.Author,
            Tags = new List<string>(post.Tags.Count),
            IsLewd = post.IsLewd,
            CreatedAt = post.CreatedAt.ToUnixTimeMilliseconds(),
            Url = post.Service switch
            {
                PostService.Twitter => $"https://twitter.com/{post.Author}/status/{post.Id}",
                PostService.Pixiv => $"https://pixiv.net/en/artworks/{post.Id}",
                _ => throw new ArgumentOutOfRangeException()
            }
        };

        foreach (TagLink postTag in post.Tags)
        {
            response.Tags.Add(postTag.Tag.Id);
        }

        return Ok(response);
    }

    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetImageAsync(string id,
        CancellationToken ct = default)

    {
        StatObjectArgs statObject = new StatObjectArgs()
            .WithBucket("posts")
            .WithObject(id);

        ObjectStat? postInfo = await this._minio.StatObjectAsync(statObject, ct);
        if (postInfo is null)
        {
            return NotFound();
        }

        MemoryStream stream = new();

        GetObjectArgs getObject = new GetObjectArgs()
            .WithBucket("posts")
            .WithObject(id)
            .WithCallbackStream(s => s.CopyTo(stream));
        await this._minio.GetObjectAsync(getObject, ct);

        CacheControlHeaderValue cacheControl = new()
        {
            Public = true,
            MaxAge = TimeSpan.FromHours(1)
        };
        this.Response.Headers.Append("Cache-Control", cacheControl.ToString());

        stream.Position = 0;
        return File(stream, postInfo.ContentType);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Staff, Admin")]
    public async Task<IActionResult> DeletePostAsync(string id, CancellationToken ct = default)
    {
        // ReSharper disable once MethodSupportsCancellation
        Post? post = await this._db.Posts.FindAsync(id);
        if (post is null)
        {
            return NotFound();
        }

        this._db.Posts.Remove(post);

        StatObjectArgs statObject = new StatObjectArgs()
            .WithBucket("posts")
            .WithObject(id);

        ObjectStat? obj = await this._minio.StatObjectAsync(statObject, ct);
        if (obj is null)
        {
            IList<User> admins = await this._userManager.GetUsersInRoleAsync("Admin");
            string adminStr = string.Join(", ", admins.Select(a => a.UserName));

            return StatusCode(500, $"Ask {adminStr} to manually delete post {id}");
        }

        RemoveObjectArgs removeObject = new RemoveObjectArgs()
            .WithBucket("posts")
            .WithObject(id);

        await this._minio.RemoveObjectAsync(removeObject, ct);

        this._db.Logs.Add(new Log
        {
            ById = Guid.Parse(this._userManager.GetUserId(this.User) ?? ""),
            Towards = id,
            Description = "Removed post"
        });

        await this._db.SaveChangesAsync(ct);

        return Ok();
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Uploader, Staff, Admin")]
    public async Task<IActionResult> EditPostAsync(string id,
        [FromBody] EditPostRequest body,
        CancellationToken ct = default)
    {
        Post? post = await this._db.Posts
            .Include(p => p.Tags)
            .ThenInclude(p => p.Tag)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (post is null)
        {
            return NotFound();
        }

        StringBuilder logDesc = new();

        if (body.Tags is not null)
        {
            string[] tags = body.Tags.Split(' ');

            post.Tags.Clear();
            foreach (string tag in tags)
            {
                // ReSharper disable once MethodSupportsCancellation
                Tag? dbTag = await this._db.Tags.FindAsync(tag);
                if (dbTag is null)
                {
                    dbTag = new Tag()
                    {
                        Id = tag
                    };
                    this._db.Tags.Add(dbTag);
                }

                this._db.TagLinks.Add(new TagLink
                {
                    Post = post,
                    Tag = dbTag
                });
            }

            logDesc.AppendLine($"Set tags to {body.Tags}");
        }

        if (body.Author is not null)
        {
            post.Author = body.Author;
            logDesc.AppendLine($"Set author to {body.Author}");
        }

        if (body.IsLewd is { } isLewd)
        {
            post.IsLewd = isLewd;
            logDesc.AppendLine($"Set IsLewd to {isLewd}");
        }

        this._db.Logs.Add(new Log
        {
            ById = Guid.Parse(this._userManager.GetUserId(this.User) ?? ""),
            Towards = post.Id,
            Description = logDesc.ToString(),
        });

        await this._db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetCommentsAsync(string id,
        [FromQuery] [Range(0, int.MaxValue)] int page = 0,
        CancellationToken ct = default)
    {
        Post? post = await this._db.Posts
            .Include(p => p.Comments.OrderByDescending(c => c.CreatedAt).Skip(page * 10).Take(50))
            .ThenInclude(c => c.Author)
            .AsNoTracking()
            .AsSplitQuery()
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (post is null)
        {
            return NotFound();
        }

        List<CommentResponse> response = new(post.Comments.Count);
        foreach (Comment comment in post.Comments)
        {
            response.Add(new CommentResponse(comment));
        }

        return Ok(response);
    }

    [Authorize("CanComment")]
    [HttpPost("{id}/comments")]
    public async Task<IActionResult> CreateCommentAsync(string id,
        [FromBody] CommentRequest body,
        CancellationToken ct = default)
    {
        User? user = await this._userManager.GetUserAsync(this.User);
        if (user is null)
        {
            return Unauthorized();
        }

        // ReSharper disable once MethodSupportsCancellation
        Post? post = await this._db.Posts.FindAsync(id);

        if (post is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(body.Content))
        {
            return BadRequest("Empty content");
        }

        Comment comment = new()
        {
            Content = body.Content,
            Author = user,
            Post = post
        };
        this._db.Comments.Add(comment);
        await this._db.SaveChangesAsync(ct);

        this._db.Logs.Add(new Log
        {
            By = user,
            Towards = post.Id,
            Description = $"Created comment {comment.Id}"
        });
        await this._db.SaveChangesAsync(ct);

        return Created("/", new CommentResponse(comment));
    }

    [HttpGet("tags")]
    public async Task<IActionResult> SearchTagsAsync([FromQuery] string query,
        CancellationToken ct = default)
    {
        List<Tag> tags = await this._db.Tags.Where(t => t.Id.Contains(query)).ToListAsync(ct);

        List<string> strTags = new(tags.Count);
        foreach (Tag tag in tags)
        {
            strTags.Add(tag.Id);
        }

        return Ok(strTags);
    }
}
