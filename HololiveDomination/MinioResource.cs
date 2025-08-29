namespace HololiveDomination;

public class MinioResource : ContainerResource, IResourceWithConnectionString
{
    private readonly ParameterResource? _username;
    private readonly ParameterResource _password;

    internal ReferenceExpression Username =>
        this._username is not null
            ? ReferenceExpression.Create($"{this._username}")
            : ReferenceExpression.Create($"admin");

    public string Ip { get; }
    public int Port { get; }

    public MinioResource(string name,
        string? ip,
        int port,
        ParameterResource? username,
        ParameterResource password) : base(name)
    {
        this.Ip = ip ?? name;
        this.Port = port;
        this._username = username;
        this._password = password;
    }

    public ReferenceExpression ConnectionStringExpression =>
        ReferenceExpression.Create(
            $"Host={this.Ip};Port={this.Port.ToString()};Username={this.Username};Password={this._password}");
}
