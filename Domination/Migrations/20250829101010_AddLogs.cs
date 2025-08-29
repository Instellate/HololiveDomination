using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domination.Migrations
{
    /// <inheritdoc />
    public partial class AddLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    towards = table.Column<string>(type: "text", nullable: false),
                    by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_logs_users_by_id",
                        column: x => x.by_id,
                        principalTable: "asp_net_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_logs_by_id",
                table: "logs",
                column: "by_id");
        }
    }
}
