namespace Domination.Entities;

public class Post
{
    public required string Id { get; init; }
    public required string Author { get; set; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public required PostService Service { get; init; }
    public required bool IsLewd { get; set; }
    public ICollection<TagLink> Tags { get; init; } = [];
    public ICollection<Comment> Comments { get; init; } = [];
}
