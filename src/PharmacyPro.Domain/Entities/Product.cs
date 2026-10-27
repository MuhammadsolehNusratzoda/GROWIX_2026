using PharmacyPro.Domain.Common;

namespace PharmacyPro.Domain.Entities;

// Маҳсулот/дору. Ҳар маҳсулот ба як фирма тааллуқ дорад.
public class Product : BaseEntity
{
    public string Name { get; set; } = null!;

    public int FirmId { get; set; }
    public Firm Firm { get; set; } = null!;

    public decimal PurchasePrice { get; set; } // нархи харид (барои як дона)
    public decimal SalePrice { get; set; }     // нархи фурӯш (барои як дона)
    public bool IsActive { get; set; } = true;
}
