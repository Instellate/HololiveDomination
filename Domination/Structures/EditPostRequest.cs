namespace Domination.Structures;

public class EditPostRequest
{
    public string? Tags { get; init; }
    public string? Author { get; init; }
    public bool? IsLewd { get; init; }
}
