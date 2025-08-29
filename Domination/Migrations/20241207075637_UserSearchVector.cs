using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace Domination.Migrations
{
    /// <inheritdoc />
    public partial class UserSearchVector : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "search_vector",
                table: "asp_net_users",
                type: "tsvector",
                nullable: false)
                .Annotation("Npgsql:TsVectorConfig", "english")
                .Annotation("Npgsql:TsVectorProperties", new[] { "user_name", "email" });

            migrationBuilder.CreateIndex(
                name: "ix_asp_net_users_search_vector",
                table: "asp_net_users",
                column: "search_vector")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_asp_net_users_search_vector",
                table: "asp_net_users");

            migrationBuilder.DropColumn(
                name: "search_vector",
                table: "asp_net_users");
        }
    }
}
