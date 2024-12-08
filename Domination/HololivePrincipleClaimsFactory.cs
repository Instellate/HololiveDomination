using System.Security.Claims;
using Domination.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Domination;

public class HololivePrincipleClaimsFactory : IUserClaimsPrincipalFactory<User>
{
    private readonly UserManager<User> _userManager;
    private readonly IOptions<IdentityOptions> _optionsAccessor;
    
    public HololivePrincipleClaimsFactory(UserManager<User> userManager,
        IOptions<IdentityOptions> optionsAccessor)
    {
        this._userManager = userManager;
        this._optionsAccessor = optionsAccessor;
    }

    public async Task<ClaimsPrincipal> CreateAsync(User user)
    {
        IList<string> roles = await this._userManager.GetRolesAsync(user);


        List<Claim> claims = new(roles.Count + 2);
        foreach (string role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
        claims.Add(new Claim(ClaimTypes.Email, user.Email ?? ""));

        UserClaimsPrincipalFactory<User> @default = new(this._userManager, this._optionsAccessor);
        ClaimsPrincipal principle = await @default.CreateAsync(user);
        claims.AddRange(principle.Claims);

        ClaimsIdentity identity = new(claims, "HololiveClaims");
        return new ClaimsPrincipal(identity);
    }
}
