using System.Data.Common;
using System.Text.Json.Serialization;
using Domination.Entities;
using Domination.Requirements;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Minio;

namespace Domination;

public static class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers()
            .AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.DefaultIgnoreCondition
                    = JsonIgnoreCondition.WhenWritingNull;
                o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        builder.Services.Configure<ForwardedHeadersOptions>(o =>
        {
            o.ForwardedHeaders
                = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        });

        builder.Services.AddCors(o => o.AddPolicy(name: "development",
            policy => policy
                .WithOrigins("https://localhost:5173")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()));

        builder.AddNpgsqlDbContext<HololiveDbContext>("postgresdb",
            configureDbContextOptions: o => o.UseSnakeCaseNamingConvention());

        builder.Services
            .AddIdentity<User, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<HololiveDbContext>()
            .AddClaimsPrincipalFactory<HololivePrincipleClaimsFactory>();
        builder.Services.ConfigureApplicationCookie(o =>
        {
            o.LoginPath = "/signin";
            o.ExpireTimeSpan = TimeSpan.FromDays(90);
            o.Cookie.Name = ".HololiveDominationSessionCookie";
            o.Cookie.SameSite = builder.Environment.IsDevelopment()
                ? SameSiteMode.None
                : SameSiteMode.Strict;
            o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            o.Cookie.HttpOnly = true;
        });

        builder.Services.AddDataProtection()
            .PersistKeysToDbContext<HololiveDbContext>();

        AuthenticationBuilder authenticationBuilder = builder.Services
            .AddAuthentication()
            .AddDiscord(o =>
            {
                IConfigurationSection discordSection
                    = builder.Configuration.GetSection("Discord");
                o.ClientId = discordSection.GetValue<string>("Id")!;
                o.ClientSecret = discordSection.GetValue<string>("Secret")!;
                o.Scope.Add("email");
                o.CallbackPath = "/api/signin-discord";
            });

        IConfigurationSection twitterSection = builder.Configuration.GetSection("Twitter");
        if (twitterSection.Exists())
        {
            authenticationBuilder.AddTwitter(o =>
            {
                o.ConsumerKey = twitterSection.GetValue<string>("Id")!;
                o.ConsumerSecret = twitterSection.GetValue<string>("Secret")!;
                o.CallbackPath = "/api/signin-twitter";
                o.RetrieveUserDetails = true;
            });
        }

        builder.Services.AddAuthorization(o =>
        {
            o.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new DisallowRoleRequirement("Banned"))
                .Build();
            o.AddPolicy("CanComment", p => p.AddRequirements(new CanCommentRequirement()));
        });

        builder.Services.AddMemoryCache();

        builder.AddMinio("minio");
        builder.Services
            .AddSingleton<IAuthorizationHandler, DisallowRoleRequirementHandler>();
        builder.Services
            .AddScoped<IAuthorizationHandler, CanCommentRequirementHandler>();

        WebApplication app = builder.Build();

        using (IServiceScope scope = app.Services.CreateScope())
        {
            HololiveDbContext db
                = scope.ServiceProvider.GetRequiredService<HololiveDbContext>();
            db.Database.Migrate();
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseCors("development");
        }
        else
        {
            app.UseForwardedHeaders();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllerRoute(name: "default", "{controller}/{action=Index}/{id?}");
        app.Run();
    }

    private static void AddMinio(this WebApplicationBuilder builder, string minioName)
    {
        string? minioConnString = builder.Configuration.GetConnectionString(minioName);
        if (minioConnString is null)
        {
            throw new ArgumentException($"{minioName} does not have a connection string");
        }

        DbConnectionStringBuilder connBuilder = new()
        {
            ConnectionString = minioConnString
        };

        if (!connBuilder.TryGetValue("Host", out object? hostObj))
        {
            throw new ArgumentException("Host is not present ");
        }

        if (hostObj is not string host)
        {
            throw new ArgumentException("Host is not string");
        }

        if (Uri.CheckHostName(host) == UriHostNameType.Unknown)
        {
            throw new ArgumentException("Host is not a valid host type");
        }

        int port;
        if (!connBuilder.TryGetValue("port", out object? portObj))
        {
            port = 9000;
        }
        else
        {
            if (portObj is int portInt)
            {
                port = portInt;
            }
            else
            {
                if (portObj is not string portStr)
                {
                    throw new ArgumentException("Port is invalid");
                }

                if (!int.TryParse(portStr, out int parsedPort))
                {
                    throw new ArgumentException("Port is not valid number");
                }

                port = parsedPort;
            }
        }

        if (!connBuilder.TryGetValue("username", out object? usernameObj))
        {
            throw new ArgumentException("Username is not present");
        }

        if (usernameObj is not string username)
        {
            throw new ArgumentException("Username is not string");
        }

        if (!connBuilder.TryGetValue("password", out object? passwordObj))
        {
            throw new ArgumentException("Password is not present");
        }

        if (passwordObj is not string password)
        {
            throw new ArgumentException("Password is not string");
        }

        builder.Services.AddSingleton<IMinioClient>(_ =>
            new MinioClient()
                .WithEndpoint(host, port)
                .WithCredentials(username, password)
                .Build());
    }
}
