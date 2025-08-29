namespace Domination.Structures;

public class LogsResponse
{
    public required IEnumerable<LogResponse> Logs { get; init; }
    public required int PageCount { get; init; }
}
