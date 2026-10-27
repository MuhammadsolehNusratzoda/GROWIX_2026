using System.ComponentModel.DataAnnotations;

namespace PharmacyPro.Application.DTOs;

public record ProductDto(
    int Id,
    string Name,
    int FirmId,
    string FirmName,
    decimal PurchasePrice,
    decimal SalePrice,
    bool IsActive,
    int QuantityOnHand);

public class CreateProductDto
{
    [Required, MaxLength(150)] public string Name { get; set; } = null!;
    [Range(1, int.MaxValue)] public int FirmId { get; set; }
    [Range(0, 1_000_000_000)] public decimal PurchasePrice { get; set; }
    [Range(0, 1_000_000_000)] public decimal SalePrice { get; set; }
}

public class UpdateProductDto : CreateProductDto
{
    public bool IsActive { get; set; } = true;
}

// ---------- Анбор ----------
public record StockItemDto(
    int ProductId,
    string ProductName,
    int QuantityOnHand,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal ValueAtCost,   // миқдор × нархи харид (ҳамон, ки ба фирма мегӯем)
    decimal ValueAtSale);  // миқдор × нархи фурӯш

public record FirmStockDto(
    int FirmId,
    string FirmName,
    int TotalQuantity,
    decimal TotalValueAtCost,
    decimal TotalValueAtSale,
    List<StockItemDto> Items);

public record StockReportDto(
    decimal TotalValueAtCost,
    decimal TotalValueAtSale,
    List<FirmStockDto> Firms);

// ---------- Фурӯши маҳсулоти як фирма ----------
public record FirmSoldItemDto(int ProductId, string ProductName, int Quantity, decimal Amount);

public record FirmLedgerDto(
    int FirmId,
    string FirmName,
    DateTime? From,
    DateTime? To,
    int TotalQuantity,
    decimal TotalSold,
    List<FirmSoldItemDto> Items);
