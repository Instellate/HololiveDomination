namespace Domination.Structures;

public class PostResponse
{
    public required string Id { get; init; }
    public required string Author { get; init; }
    public required List<string> Tags { get; init; }
    public required string Url { get; set; }
    public required long CreatedAt { get; init; }
}
