using Microsoft.AspNetCore.Identity;
using NpgsqlTypes;

namespace Domination.Entities;

public class User : IdentityUser<Guid>
{
    public NpgsqlTsVector SearchVector { get; init; } = null!;
    public bool CanChangeUsername { get; set; } = true;
    public bool CanComment { get; set; } = true;
}
