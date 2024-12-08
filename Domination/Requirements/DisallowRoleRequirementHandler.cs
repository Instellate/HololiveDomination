using Microsoft.AspNetCore.Authorization;

namespace Domination.Requirements;

public class DisallowRoleRequirementHandler : AuthorizationHandler<DisallowRoleRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
        DisallowRoleRequirement requirement)
    {
        if (context.User.IsInRole(requirement.RoleToDisallow))
        {
            context.Fail();
        }
        else
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
