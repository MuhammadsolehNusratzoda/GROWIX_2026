using PharmacyPro.Application.DTOs;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Common;

public static class PurchaseMappings
{
    public static FirmPurchaseItemDto ToDto(this FirmPurchaseItem i) =>
        new(i.Id, i.ProductId, i.Product?.Name ?? "", i.Quantity, i.UnitCost, i.Quantity * i.UnitCost);

    public static FirmPurchaseDto ToDto(this FirmPurchase p) =>
        new(p.Id, p.FirmId, p.Firm?.Name ?? "", p.Amount, p.PurchaseDate, p.InvoiceNumber, p.Note,
            p.Items.Select(i => i.ToDto()).ToList());

    public static ProductDto ToDto(this Product p, int quantityOnHand) =>
        new(p.Id, p.Name, p.FirmId, p.Firm?.Name ?? "", p.PurchasePrice, p.SalePrice, p.IsActive, quantityOnHand);
}
