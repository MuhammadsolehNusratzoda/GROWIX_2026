using PharmacyPro.Application.DTOs;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Common;

public static class PurchaseMappings
{
    public static FirmPurchaseDto ToDto(this FirmPurchase p) =>
        new(p.Id, p.FirmId, p.Firm?.Name ?? "", p.Amount, p.PurchaseDate, p.InvoiceNumber, p.Note);
}
