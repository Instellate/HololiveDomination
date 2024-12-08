using Microsoft.AspNetCore.Authorization;

namespace Domination.Requirements;

public class DisallowRoleRequirement : IAuthorizationRequirement
{
    public string RoleToDisallow { get; }
    
    public DisallowRoleRequirement(string roleToDisallow)
    {
        this.RoleToDisallow = roleToDisallow;
    }
}
