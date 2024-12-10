namespace Domination.Structures;

public class UserResponse
{
    public required Guid Id { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public required IList<string> Roles { get; init; }
}
