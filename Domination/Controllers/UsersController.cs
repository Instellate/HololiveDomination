using System.ComponentModel.DataAnnotations;
using System.Text;
using Domination.Entities;
using Domination.Structures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Domination.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly char[] ModeratedNameChars
        = "abcdefghijklmnopqrstuvwxyz0123456789".ToCharArray();

    private readonly HololiveDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public UsersController(HololiveDbContext db,
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        this._db = db;
        this._userManager = userManager;
        this._roleManager = roleManager;
    }

    [HttpGet]
    [Authorize(Roles = "Staff, Admin")]
    public async Task<IActionResult> GetUsersAsync([FromQuery] string? search,
        [FromQuery] [Range(0, int.MaxValue)] int page = 0,
        CancellationToken ct = default)
    {
        List<User> users;
        int pageCount;
        if (search is not null)
        {
            users = await this._db.Users
                // ReSharper disable once EntityFramework.UnsupportedServerSideFunctionCall
                .Where(u => u.SearchVector.Matches(search))
                .OrderByDescending(u => u.Id)
                .Skip(20 * page)
                .Take(20)
                .ToListAsync(ct);

            pageCount = await this._db.Users
                // ReSharper disable once EntityFramework.UnsupportedServerSideFunctionCall
                .Where(u => u.SearchVector.Matches(search))
                .CountAsync(ct);
        }
        else
        {
            users = await this._db.Users
                .OrderByDescending(u => u.Id)
                .Skip(20 * page)
                .Take(20)
                .ToListAsync(ct);
            pageCount = await this._db.Users.CountAsync(ct);
        }

        List<UserResponse> response = new(users.Count);
        foreach (User user in users)
        {
            response.Add(new UserResponse
            {
                Id = user.Id,
                Username = user.UserName ?? "No username",
                Email = user.Email ?? "No email",
                Roles = await this._userManager.GetRolesAsync(user),
            });
        }

        return Ok(new UsersResponse
        {
            Users = response,
            PageCount = pageCount / 20 + 1,
        });
    }

    [Authorize]
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        User? user = await this._userManager.GetUserAsync(this.User);
        if (user is null)
        {
            return Unauthorized();
        }

        UserResponse response = new()
        {
            Id = user.Id,
            Username = user.UserName ?? "No username",
            Email = user.Email ?? "No email",
            Roles = await this._userManager.GetRolesAsync(user),
        };

        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Staff, Admin")]
    public async Task<IActionResult> GetUserAsync(Guid id)
    {
        User? user = await this._db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        UserResponse response = new()
        {
            Id = user.Id,
            Username = user.UserName ?? "No username",
            Email = user.Email ?? "No email",
            Roles = await this._userManager.GetRolesAsync(user),
        };

        return Ok(response);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Staff, Admin")]
    public async Task<IActionResult> EditUserAsync(Guid id,
        [FromBody] EditUserRequest body,
        CancellationToken ct = default)
    {
        User? requestor = await this._userManager.GetUserAsync(this.User);
        if (requestor is null)
        {
            return Unauthorized();
        }

        // ReSharper disable once MethodSupportsCancellation
        User? requestedUser = await this._db.Users.FindAsync(id);
        if (requestedUser is null)
        {
            return NotFound();
        }

        IList<string> requestorRoles = await this._userManager.GetRolesAsync(requestor);
        UserRoles requestorHighestRole = UserRoles.None;
        foreach (string requestorRole in requestorRoles)
        {
            if (Enum.TryParse(requestorRole, out UserRoles role))
            {
                if (requestorHighestRole < role)
                {
                    requestorHighestRole = role;
                }
            }
        }

        IList<string> requestedUserRoles = await this._userManager.GetRolesAsync(requestedUser);
        UserRoles requestedUserHighestRole = UserRoles.None;
        foreach (string requestedUserRole in requestedUserRoles)
        {
            if (Enum.TryParse(requestedUserRole, out UserRoles role))
            {
                if (requestedUserHighestRole < role)
                {
                    requestedUserHighestRole = role;
                }
            }
        }

        if (requestedUserHighestRole >= requestorHighestRole)
        {
            return Forbid();
        }

        if (body.Role is { } bodyRole)
        {
            if (requestorHighestRole <= bodyRole)
            {
                return Forbid();
            }

            IdentityResult removeResult = await this._userManager.RemoveFromRolesAsync(
                requestedUser,
                requestedUserRoles);
            if (!removeResult.Succeeded)
            {
                return BadRequest(removeResult.Errors);
            }

            if (body.Role != UserRoles.None)
            {
                bool roleExists = await this._roleManager.RoleExistsAsync(bodyRole.ToString());
                if (!roleExists)
                {
                    await this._roleManager.CreateAsync(new IdentityRole<Guid>
                    {
                        Name = body.Role.ToString(),
                    });
                }

                await this._userManager.AddToRoleAsync(requestedUser, bodyRole.ToString());
            }
        }

        if (body.RemoveUsername)
        {
            StringBuilder sb = new();
            sb.Append("DeletedName-");
            for (int i = 0; i < 5; i++)
            {
                int randomEntry = Random.Shared.Next(0, ModeratedNameChars.Length - 1);
                sb.Append(ModeratedNameChars[randomEntry]);
            }

            await this._userManager.SetUserNameAsync(requestedUser, sb.ToString());
        }

        if (body.DisallowChangingUsername is true)
        {
            requestedUser.CanChangeUsername = false;
        }
        else if (body.DisallowChangingUsername is false)
        {
            requestedUser.CanChangeUsername = true;
        }

        if (body.DisallowCommenting is true)
        {
            requestedUser.CanComment = false;
        }
        else if (body.DisallowCommenting is false)
        {
            requestedUser.CanComment = true;
        }

        if (body.IsBanned is true)
        {
            bool roleExists = await this._roleManager.RoleExistsAsync("Banned");
            if (!roleExists)
            {
                await this._roleManager.CreateAsync(new IdentityRole<Guid>
                {
                    Name = "Banned"
                });
            }

            await this._userManager.AddToRoleAsync(requestedUser, "Banned");
            await this._userManager.RemoveFromRolesAsync(requestedUser, requestedUserRoles);
        }
        else if (body.IsBanned is false)
        {
            await this._userManager.RemoveFromRoleAsync(requestedUser, "Banned");
        }

        await this._db.SaveChangesAsync(ct);
        return Ok(new UserResponse
        {
            Id = requestedUser.Id,
            Username = requestedUser.UserName ?? "No username",
            Email = requestedUser.Email ?? "No email",
            Roles = await this._userManager.GetRolesAsync(requestedUser)
        });
    }

    [Authorize]
    [HttpPatch("current")]
    public async Task<IActionResult> EditCurrentUserAsync([FromBody] EditCurrentUserRequest body,
        CancellationToken ct = default)
    {
        User? user = await this._userManager.GetUserAsync(this.User);
        if (user is null)
        {
            return Unauthorized();
        }

        this._db.Add(user);

        if (body.Username is not null)
        {
            if (user.CanChangeUsername)
            {
                user.UserName = body.Username;
            }
            else
            {
                return Forbid();
            }
        }

        await this._db.SaveChangesAsync(ct);
        return Ok();
    }
}
