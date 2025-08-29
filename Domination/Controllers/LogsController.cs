using Domination.Entities;
using Domination.Structures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;

namespace Domination.Controllers;

[ApiController]
[Authorize(Roles = "Staff, Admin")]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly HololiveDbContext _db;

    public LogsController(HololiveDbContext db)
    {
        this._db = db;
    }

    public async Task<IActionResult> GetLogsAsync(
        [FromQuery] Guid? by = null,
        [FromQuery] string? towards = null,
        [FromQuery] int page = 0,
        CancellationToken ct = default)
    {
        IQueryable<Log> query = this._db.Logs;

        if (by is not null)
        {
            query = query.Where(l => l.ById == by);
        }

        if (towards is not null)
        {
            query = query.Where(l => l.Towards == towards);
        }

        query = query
            .OrderByDescending(l => l.CreatedAt)
            .Skip(page * 20)
            .Take(20);

        List<Log> logs = await query.ToListAsync(ct);

        int pageCount = await this._db.Logs.CountAsync(ct);
        return Ok(new LogsResponse()
        {
            Logs = logs.Select(l => new LogResponse(l)),
            PageCount = (pageCount + 20 - 1) / 20
        });
    }
}
