using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TennisStringTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEditPasswordHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EditPasswordHash",
                table: "Trackers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EditPasswordHash",
                table: "Trackers");
        }
    }
}
