namespace Domination.Structures;

public class UsersResponse
{
    public required List<UserResponse> Users { get; init; }
    public required int PageCount { get; init; }
}
