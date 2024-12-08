namespace Domination.Entities;

public class TagLink()
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required Post Post { get; set; }
    public required Tag Tag { get; set; }
}

// public record TagLink(Guid Id, Post Post, Tag Tag);
