using Domination.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace Domination.Requirements;

public class CanCommentRequirementHandler : AuthorizationHandler<CanCommentRequirement>
{
    private readonly UserManager<User> _userManager;

    public CanCommentRequirementHandler(UserManager<User> userManager)
    {
        this._userManager = userManager;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
        CanCommentRequirement requirement)
    {
        User? user = await this._userManager.GetUserAsync(context.User);
        if (user is null)
        {
            context.Fail();
            return;
        }

        if (user.CanComment)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail();
        }
    }
}
