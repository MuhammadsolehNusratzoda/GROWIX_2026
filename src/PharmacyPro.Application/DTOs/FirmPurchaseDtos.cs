using System.ComponentModel.DataAnnotations;

namespace PharmacyPro.Application.DTOs;

public record FirmPurchaseDto(
    int Id,
    int FirmId,
    string FirmName,
    decimal Amount,
    DateTime PurchaseDate,
    string? InvoiceNumber,
    string? Note);

public class CreateFirmPurchaseDto
{
    [Range(1, int.MaxValue)] public int FirmId { get; set; }
    [Range(0.01, 1_000_000_000)] public decimal Amount { get; set; }
    [Required] public DateTime PurchaseDate { get; set; }
    [MaxLength(50)] public string? InvoiceNumber { get; set; }
    [MaxLength(500)] public string? Note { get; set; }
}

public class UpdateFirmPurchaseDto : CreateFirmPurchaseDto { }

// Баланси як фирма: Debt = TotalPurchased - TotalPaid
// Debt > 0: мо қарздорем. Debt < 0: ба фирма пешпардохт кардаем.
public record FirmBalanceDto(
    int FirmId,
    string FirmName,
    string? Phone,
    decimal TotalPurchased,
    decimal TotalPaid,
    decimal Debt);

// TotalDebt = ҷамъи танҳо қарзҳои мусбат (пешпардохтҳо ҳисоб намешаванд)
public record FirmBalancesDto(decimal TotalDebt, List<FirmBalanceDto> Firms);
