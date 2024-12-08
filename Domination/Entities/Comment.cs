using System.ComponentModel.DataAnnotations;

namespace Domination.Entities;

public class Comment
{
    public Guid Id { get; init; }

    [StringLength(100)]
    public required string Content { get; set; }

    public required User Author { get; init; }
    public Guid AuthorId { get; init; }
    public required Post Post { get; init; }
    
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
}
