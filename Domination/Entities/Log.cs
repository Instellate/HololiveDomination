namespace Domination.Entities;

/// <summary>
/// A class that logs actions done by users
/// </summary>
public class Log
{
    public Guid Id { get; init; }

    /// <summary>
    /// What the action was done to, either a user, post or comment
    /// </summary>
    public required string Towards { get; init; }

    /// <summary>
    /// Who the action was done by
    /// </summary>
    public User By { get; init; } = null!;

    public Guid ById { get; init; }

    public required string Description { get; init; }

    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
}
