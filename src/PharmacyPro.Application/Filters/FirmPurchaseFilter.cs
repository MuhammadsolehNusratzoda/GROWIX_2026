namespace PharmacyPro.Application.Filters;

public class FirmPurchaseFilter : PaginationFilter
{
    public int? FirmId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
