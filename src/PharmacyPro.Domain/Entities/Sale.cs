using PharmacyPro.Domain.Common;
using PharmacyPro.Domain.Enums;

namespace PharmacyPro.Domain.Entities;

public class Sale : BaseEntity
{
    public decimal Amount { get; set; }
    public DateTime SaleDate { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public string? Note { get; set; }
    public string CreatedByUserId { get; set; } = null!;

    // Агар фурӯш бо маҳсулот сабт шуда бошад, Amount = ҷамъи сатрҳо
    public ICollection<SaleItem> Items { get; set; } = new List<SaleItem>();
}
