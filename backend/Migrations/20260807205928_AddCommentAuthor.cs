using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TennisStringTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Author",
                table: "Comments",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Author",
                table: "Comments");
        }
    }
}
