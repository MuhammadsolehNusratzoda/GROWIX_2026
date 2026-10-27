using System.ComponentModel.DataAnnotations;
using PharmacyPro.Domain.Enums;

namespace PharmacyPro.Application.DTOs;

public record SaleItemDto(
    int Id,
    int ProductId,
    string ProductName,
    int FirmId,
    string FirmName,
    int Quantity,
    decimal UnitPrice,
    decimal Total);

public record SaleDto(
    int Id,
    decimal Amount,
    DateTime SaleDate,
    PaymentMethod Method,
    string? Note,
    DateTime CreatedAt,
    List<SaleItemDto> Items);

public class SaleItemInputDto
{
    [Range(1, int.MaxValue)] public int ProductId { get; set; }
    [Range(1, 1_000_000)] public int Quantity { get; set; }
    [Range(0, 1_000_000_000)] public decimal UnitPrice { get; set; }
}

public class CreateSaleDto
{
    // Агар Items бошад, сервер Amount-ро аз сатрҳо худаш ҳисоб мекунад
    [Range(0, 1_000_000_000)] public decimal Amount { get; set; }
    [Required] public DateTime SaleDate { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    [MaxLength(500)] public string? Note { get; set; }
    public List<SaleItemInputDto>? Items { get; set; }
}

public class UpdateSaleDto : CreateSaleDto { }
