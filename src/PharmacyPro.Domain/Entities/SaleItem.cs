using PharmacyPro.Domain.Common;

namespace PharmacyPro.Domain.Entities;

// Сатри фурӯш: кадом маҳсулот, чанд дона, бо кадом нарх (анбор кам мешавад)
public class SaleItem : BaseEntity
{
    public int SaleId { get; set; }
    public Sale Sale { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // Фирмаи маҳсулот дар лаҳзаи фурӯш (барои ҳисоби ҳар фирма)
    public int FirmId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
