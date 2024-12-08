using System.ComponentModel.DataAnnotations;

namespace Domination.Structures;

public class CommentRequest
{
    [StringLength(100)]
    public required string Content { get; init; }
}
