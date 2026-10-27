using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PharmacyPro.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFirmPurchases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FirmPurchases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirmId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FirmPurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FirmPurchases_Firms_FirmId",
                        column: x => x.FirmId,
                        principalTable: "Firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FirmPurchases_FirmId",
                table: "FirmPurchases",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_FirmPurchases_PurchaseDate",
                table: "FirmPurchases",
                column: "PurchaseDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FirmPurchases");
        }
    }
}
