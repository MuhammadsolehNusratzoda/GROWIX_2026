using System.ComponentModel.DataAnnotations;

namespace PharmacyPro.Application.DTOs;

public record FirmPurchaseItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int Quantity,
    decimal UnitCost,
    decimal Total);

public record FirmPurchaseDto(
    int Id,
    int FirmId,
    string FirmName,
    decimal Amount,
    DateTime PurchaseDate,
    string? InvoiceNumber,
    string? Note,
    List<FirmPurchaseItemDto> Items);

public class FirmPurchaseItemInputDto
{
    [Range(1, int.MaxValue)] public int ProductId { get; set; }
    [Range(1, 1_000_000)] public int Quantity { get; set; }
    [Range(0, 1_000_000_000)] public decimal UnitCost { get; set; }
}

public class CreateFirmPurchaseDto
{
    [Range(1, int.MaxValue)] public int FirmId { get; set; }
    // Агар Items бошад, сервер Amount-ро аз сатрҳо худаш ҳисоб мекунад
    [Range(0, 1_000_000_000)] public decimal Amount { get; set; }
    [Required] public DateTime PurchaseDate { get; set; }
    [MaxLength(50)] public string? InvoiceNumber { get; set; }
    [MaxLength(500)] public string? Note { get; set; }
    public List<FirmPurchaseItemInputDto>? Items { get; set; }
}

public class UpdateFirmPurchaseDto : CreateFirmPurchaseDto { }

// Баланси як фирма:
//   Debt = TotalPurchased - TotalPaid      (қарзи мо; фурӯш худкор кам намекунад)
//   TotalSold                              (фурӯши маҳсулоти ҳамин фирма)
//   SoldNotPaid = max(0, TotalSold - TotalPaid)  (аз фурӯш дар дасти мо, ба фирма надодаем)
public record FirmBalanceDto(
    int FirmId,
    string FirmName,
    string? Phone,
    decimal TotalPurchased,
    decimal TotalSold,
    decimal TotalPaid,
    decimal Debt,
    decimal SoldNotPaid);

// TotalDebt = ҷамъи танҳо қарзҳои мусбат (пешпардохтҳо ҳисоб намешаванд)
public record FirmBalancesDto(decimal TotalDebt, List<FirmBalanceDto> Firms);
