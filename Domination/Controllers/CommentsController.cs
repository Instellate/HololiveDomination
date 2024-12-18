using Domination.Entities;
using Domination.Structures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Domination.Controllers;

[ApiController]
[Authorize("CanComment")]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly HololiveDbContext _db;
    private readonly UserManager<User> _userManager;

    public CommentsController(HololiveDbContext db, UserManager<User> userManager)
    {
        this._db = db;
        this._userManager = userManager;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditCommentAsync(Guid id,
        [FromBody] CommentRequest body,
        CancellationToken ct = default)
    {
        User? user = await this._userManager.GetUserAsync(this.User);
        if (user is null)
        {
            return Unauthorized();
        }

        // ReSharper disable once MethodSupportsCancellation
        Comment? comment = await this._db.Comments.FindAsync(id);
        if (comment is null)
        {
            return NotFound();
        }

        if (comment.AuthorId != user.Id)
        {
            return Forbid();
        }

        comment.Content = body.Content;
        await this._db.SaveChangesAsync(ct);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCommentAsync(Guid id, CancellationToken ct = default)
    {
        User? user = await this._userManager.GetUserAsync(this.User);
        if (user is null)
        {
            return Unauthorized();
        }

        // ReSharper disable once MethodSupportsCancellation
        Comment? comment = await this._db.Comments.FindAsync(id);
        if (comment is null)
        {
            return NotFound();
        }

        if (comment.AuthorId != user.Id)
        {
            IList<string> roles = await this._userManager.GetRolesAsync(user);
            bool isStaff = false;
            foreach (string role in roles)
            {
                if (role == "Admin")
                {
                    isStaff = true;
                    break;
                }

                if (role == "Staff")
                {
                    isStaff = true;
                    break;
                }
            }

            if (!isStaff)
            {
                return Forbid();
            }
        }

        this._db.Comments.Remove(comment);
        await this._db.SaveChangesAsync(ct);
        return Ok();
    }
}
