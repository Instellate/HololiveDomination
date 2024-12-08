using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Domination;

public class HololiveDesignTimeFactory : IDesignTimeDbContextFactory<HololiveDbContext>
{
    public HololiveDbContext CreateDbContext(string[] args)
    {
        DbContextOptionsBuilder<HololiveDbContext> builder = new();
        builder.UseNpgsql("Host=localhost:5432;Database=shattered;Username=postgres")
            .UseSnakeCaseNamingConvention();

        return new HololiveDbContext(builder.Options);
    }
}
