using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domination.Migrations
{
    /// <inheritdoc />
    public partial class Comments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "can_change_username",
                table: "asp_net_users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "can_comment",
                table: "asp_net_users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    post_id = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_comments", x => x.id);
                    table.ForeignKey(
                        name: "fk_comments_posts_post_id",
                        column: x => x.post_id,
                        principalTable: "posts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_comments_users_author_id",
                        column: x => x.author_id,
                        principalTable: "asp_net_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_comments_author_id",
                table: "comments",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "ix_comments_post_id",
                table: "comments",
                column: "post_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "comments");

            migrationBuilder.DropColumn(
                name: "can_change_username",
                table: "asp_net_users");

            migrationBuilder.DropColumn(
                name: "can_comment",
                table: "asp_net_users");
        }
    }
}
