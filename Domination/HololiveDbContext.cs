using Domination.Entities;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Domination;

public class HololiveDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>,
    IDataProtectionKeyContext
{
    public DbSet<Post> Posts { get; init; } = null!;
    public DbSet<Tag> Tags { get; init; } = null!;
    public DbSet<TagLink> TagLinks { get; init; } = null!;
    public DbSet<Comment> Comments { get; init; } = null!;

    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;

    public DbSet<Log> Logs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasGeneratedTsVectorColumn(u => u.SearchVector,
                "english",
                u => new { u.UserName, u.Email })
            .HasIndex(u => u.SearchVector)
            .HasMethod("GIN");

        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().ToTable("asp_net_users");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("asp_net_user_tokens");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("asp_net_user_logins");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("asp_net_user_claims");
        modelBuilder.Entity<IdentityRole<Guid>>().ToTable("asp_net_roles");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("asp_net_user_roles");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("asp_net_role_claims");
    }

    public HololiveDbContext(DbContextOptions<HololiveDbContext> options) : base(options)
    {
    }
}
