namespace Domination.Structures;

public class PostsResponse
{
    public required List<PostResponse> Posts { get; init; }
    public required int PageCount { get; init; }
}
