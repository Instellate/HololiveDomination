namespace Domination.Structures;

public class CommentsResponse
{
    public required Guid Id { get; init; }
    public required string Content { get; init; }
    public required CommentAuthorResponse Author { get; init; }
    public required long CreatedAt { get; init; }
}
