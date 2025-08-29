using Domination.Entities;

namespace Domination.Structures;

public class CommentResponse
{
    public Guid Id { get; init; }
    public string Content { get; init; }
    public CommentAuthorResponse Author { get; init; }
    public long CreatedAt { get; init; }

    public CommentResponse(Comment comment)
    {
        this.Id = comment.Id;
        this.Content = comment.Content;
        this.Author = new CommentAuthorResponse
        {
            Id = comment.Author.Id,
            Name = comment.Author.UserName ?? "",
        };
        this.CreatedAt = comment.CreatedAt.ToUnixTimeMilliseconds();
    }
}
