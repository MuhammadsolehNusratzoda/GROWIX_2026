using PharmacyPro.Domain.Common;

namespace PharmacyPro.Domain.Entities;

// Сатри харид: кадом маҳсулот, чанд дона, бо кадом нарх (анбор меафзояд)
public class FirmPurchaseItem : BaseEntity
{
    public int FirmPurchaseId { get; set; }
    public FirmPurchase FirmPurchase { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}
