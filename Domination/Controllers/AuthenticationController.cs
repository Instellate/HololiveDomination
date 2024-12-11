using System.Security.Claims;
using Domination.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace Domination.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    private static bool? _isFirstUser;
    private readonly SignInManager<User> _signInManager;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly HololiveDbContext _db;

    public AuthenticationController(SignInManager<User> signInManager,
        UserManager<User> userManager,
        HololiveDbContext db,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        this._signInManager = signInManager;
        this._userManager = userManager;
        this._db = db;
        this._roleManager = roleManager;
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetProvidersAsync()
    {
        IAuthenticationSchemeProvider schemeProvider = HttpContext.RequestServices
            .GetRequiredService<IAuthenticationSchemeProvider>();

        List<string> providers = [];
        foreach (AuthenticationScheme scheme in await schemeProvider.GetAllSchemesAsync())
        {
            if (!string.IsNullOrWhiteSpace(scheme.DisplayName))
            {
                providers.Add(scheme.DisplayName);
            }
        }

        return Ok(providers);
    }

    [HttpGet("challenge")]
    public async Task<IActionResult> ChallengeAsync([FromQuery] string provider)
    {
        if (string.IsNullOrWhiteSpace(provider))
        {
            return BadRequest("Provider cannot only contain whitespace");
        }

        IAuthenticationSchemeProvider schemeProvider = HttpContext.RequestServices
            .GetRequiredService<IAuthenticationSchemeProvider>();
        IEnumerable<AuthenticationScheme> providers = await schemeProvider.GetAllSchemesAsync();

        bool providerExists = false;
        foreach (AuthenticationScheme p in providers)
        {
            if (provider.Equals(p.DisplayName))
            {
                providerExists = true;
                break;
            }
        }

        if (!providerExists)
        {
            return BadRequest("Provider doesn't exist");
        }

        AuthenticationProperties properties
            = this._signInManager.ConfigureExternalAuthenticationProperties(provider,
                "/api/Authentication/callback");
        return Challenge(properties, provider);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> CallbackAsync()
    {
        ExternalLoginInfo? info = await this._signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            return BadRequest("No login info found");
        }

        SignInResult result
            = await this._signInManager.ExternalLoginSignInAsync(info.LoginProvider,
                info.ProviderKey,
                true);

        if (!result.Succeeded)
        {
            string? username = info.Principal.FindFirstValue(ClaimTypes.Name);
            string? email = info.Principal.FindFirstValue(ClaimTypes.Email);

            if (email is not null)
            {
                User? maybeUser = await this._userManager.FindByEmailAsync(email);
                if (maybeUser is not null)
                {
                    await this._userManager.AddLoginAsync(maybeUser, info);
                    SignInResult newStatus = await this._signInManager.ExternalLoginSignInAsync(
                        info.LoginProvider,
                        info.ProviderKey,
                        true);
                    if (!newStatus.Succeeded)
                    {
                        return StatusCode(500);
                    }
                    else
                    {
                        return Redirect("/");
                    }
                }
            }

            if (username is null)
            {
                return BadRequest("No username provided");
            }

            if (email is null)
            {
                return BadRequest("No email provided");
            }

            User user = new()
            {
                UserName = username,
                Email = email
            };

            await this._userManager.CreateAsync(user);
            await this._userManager.AddLoginAsync(user, info);
            await this._signInManager.ExternalLoginSignInAsync(info.LoginProvider,
                info.ProviderKey,
                true);

            _isFirstUser ??= await this._db.Users.CountAsync() == 1;
            if (_isFirstUser.Value)
            {
                if (await this._roleManager.Roles.FirstOrDefaultAsync(r => r.Name == "Admin") is
                    null)
                {
                    IdentityRole<Guid> role = new()
                    {
                        Name = "Admin"
                    };
                    await this._roleManager.CreateAsync(role);
                }

                await this._userManager.AddToRoleAsync(user, "Admin");
            }
        }

        return Redirect("/");
    }

    [Authorize]
    [HttpDelete("signout")]
    public async Task<IActionResult> SignOutAsync()
    {
        await this._signInManager.SignOutAsync();
        return Ok();
    }
}
