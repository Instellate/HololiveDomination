using Domination.Entities;

namespace Domination.Structures;

public class LogResponse
{
    public string By { get; set; }
    public string Towards { get; set; }
    public string Description { get; set; }
    public long CreatedAt { get; set; }

    public LogResponse(Log log)
    {
        this.By = log.ById.ToString();
        this.Towards = log.Towards;
        this.Description = log.Description;
        this.CreatedAt = log.CreatedAt.ToUnixTimeMilliseconds();
    }
}
