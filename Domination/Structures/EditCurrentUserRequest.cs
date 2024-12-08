using System.ComponentModel.DataAnnotations;

namespace Domination.Structures;

public class EditCurrentUserRequest
{
    [StringLength(50)]
    public string? Username { get; init; }
}
