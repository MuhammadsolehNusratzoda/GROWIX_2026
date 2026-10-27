namespace PharmacyPro.Application.Filters;

public class ProductFilter : PaginationFilter
{
    public string? Search { get; set; }
    public int? FirmId { get; set; }
    public bool? IsActive { get; set; }
}
