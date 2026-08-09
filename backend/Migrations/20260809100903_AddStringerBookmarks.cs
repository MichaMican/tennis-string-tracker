using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TennisStringTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStringerBookmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stringers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stringers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrackerBookmarks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StringerId = table.Column<Guid>(type: "uuid", nullable: false),
                    TrackerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Tags = table.Column<List<string>>(type: "text[]", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackerBookmarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrackerBookmarks_Stringers_StringerId",
                        column: x => x.StringerId,
                        principalTable: "Stringers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TrackerBookmarks_Trackers_TrackerId",
                        column: x => x.TrackerId,
                        principalTable: "Trackers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stringers_Username",
                table: "Stringers",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrackerBookmarks_StringerId_TrackerId",
                table: "TrackerBookmarks",
                columns: new[] { "StringerId", "TrackerId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrackerBookmarks_TrackerId",
                table: "TrackerBookmarks",
                column: "TrackerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrackerBookmarks");

            migrationBuilder.DropTable(
                name: "Stringers");
        }
    }
}
