namespace Domination.Entities;

public class Tag
{
    public required string Id { get; init; }
    public ICollection<TagLink> Posts { get; init; } = [];
}
