using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Filters;
using PharmacyPro.Application.Responses;

namespace PharmacyPro.Application.Interfaces;

public interface IProductService
{
    Task<PagedResponse<ProductDto>> GetAllAsync(ProductFilter filter);
    Task<Response<ProductDto>> GetByIdAsync(int id);
    Task<Response<ProductDto>> CreateAsync(CreateProductDto dto);
    Task<Response<ProductDto>> UpdateAsync(int id, UpdateProductDto dto);
    Task<Response<bool>> DeleteAsync(int id);
}

public interface IStockService
{
    // Миқдори ҳозираи ҳар маҳсулот: ҷамъи харид - ҷамъи фурӯш
    Task<Dictionary<int, int>> GetOnHandAsync(IEnumerable<int> productIds);
    Task<Response<StockReportDto>> GetReportAsync();
}

public interface IFirmLedgerService
{
    Task<Response<FirmLedgerDto>> GetAsync(int firmId, DateTime? from, DateTime? to);
}
