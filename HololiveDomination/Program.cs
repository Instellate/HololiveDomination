using HololiveDomination;

IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

IResourceBuilder<PostgresServerResource> postgres
    = builder.AddPostgres("postgres").WithDataVolume();
IResourceBuilder<PostgresDatabaseResource> postgresdb
    = postgres.AddDatabase("postgresdb", "hololive");

IResourceBuilder<MinioResource> minio = builder.AddMinio("minio")
    .WithVolume("minio_data", "/data");

builder.AddProject<Projects.Domination>("api")
    .WithReference(postgresdb)
    .WithReference(postgres)
    .WithReference(minio)
    .WithEnvironment(c =>
    {
        c.EnvironmentVariables["Discord__Id"]
            = builder.Configuration.GetSection("Discord")["Id"]!;
        c.EnvironmentVariables["Discord__Secret"]
            = builder.Configuration.GetSection("Discord")["Secret"]!;
    });

builder.Build().Run();
