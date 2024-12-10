namespace Domination.Structures;

public class StaffUserResponse : UserResponse
{
    public required bool CanChangeUsername { get; init; }
    public required bool CanComment { get; init; }
    public required bool IsBanned { get; init; }
}
