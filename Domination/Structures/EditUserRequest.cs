namespace Domination.Structures;

public class EditUserRequest
{
    public UserRoles? Role { get; init; }
    public bool RemoveUsername { get; init; } = false;
    public bool? DisallowChangingUsername { get; init; }
    public bool? DisallowCommenting { get; init; }
    public bool? IsBanned { get; init; }
}
