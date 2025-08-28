namespace HololiveDomination;

public static class MinioResourceBuilder
{
    public static IResourceBuilder<MinioResource> AddMinio(
        this IDistributedApplicationBuilder builder,
        string name,
        IResourceBuilder<ParameterResource>? username = null,
        IResourceBuilder<ParameterResource>? password = null,
        int? port = null)
    {
        ParameterResource minioPassword
            = password is not null
                ? password.Resource
                : ParameterResourceBuilderExtensions.CreateDefaultPasswordParameter(
                    builder,
                    $"{name}-password");

        MinioResource resource
            = new(name,
                "localhost",
                port ?? 9000,
                username?.Resource,
                minioPassword);

        IResourceBuilder<MinioResource> resourceBuilder = builder
            .AddResource(resource)
            .WithImage("minio/minio")
            .WithImageRegistry("docker.io")
            .WithEnvironment("MINIO_ROOT_PASSWORD", minioPassword)
            .WithHttpEndpoint(port: port ?? 9000, targetPort: 9000)
            .WithArgs("server", "/data");

        return resourceBuilder.WithEnvironment("MINIO_ROOT_USER", resource.Username);
    }
}
