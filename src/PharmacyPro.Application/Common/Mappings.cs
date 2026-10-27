using PharmacyPro.Application.DTOs;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Common;

public static class Mappings
{
    public static FirmDto ToDto(this Firm f) =>
        new(f.Id, f.Name, f.Phone, f.Address, f.IsActive, f.CreatedAt);

    public static SaleItemDto ToDto(this SaleItem i) =>
        new(i.Id, i.ProductId, i.Product?.Name ?? "", i.FirmId, i.Product?.Firm?.Name ?? "",
            i.Quantity, i.UnitPrice, i.Quantity * i.UnitPrice);

    public static SaleDto ToDto(this Sale s) =>
        new(s.Id, s.Amount, s.SaleDate, s.Method, s.Note, s.CreatedAt,
            s.Items.Select(i => i.ToDto()).ToList());

    public static ExpenseCategoryDto ToDto(this ExpenseCategory c) => new(c.Id, c.Name);

    public static ExpenseDto ToDto(this Expense e) =>
        new(e.Id, e.CategoryId, e.Category?.Name ?? "", e.Amount, e.ExpenseDate, e.Note);

    public static FirmPaymentDto ToDto(this FirmPayment p) =>
        new(p.Id, p.FirmId, p.Firm?.Name ?? "", p.Amount, p.PaymentDate, p.Method, p.Note);
}
