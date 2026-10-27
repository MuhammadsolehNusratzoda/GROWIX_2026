using PharmacyPro.Domain.Common;

namespace PharmacyPro.Domain.Entities;

// Мол, ки аз фирма гирифта шуд (қарз ба фирма меафзояд)
public class FirmPurchase : BaseEntity
{
    public int FirmId { get; set; }
    public Firm Firm { get; set; } = null!;

    public decimal Amount { get; set; }
    public DateTime PurchaseDate { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Note { get; set; }

    // Агар харид бо маҳсулот сабт шуда бошад, Amount = ҷамъи сатрҳо
    public ICollection<FirmPurchaseItem> Items { get; set; } = new List<FirmPurchaseItem>();
}
