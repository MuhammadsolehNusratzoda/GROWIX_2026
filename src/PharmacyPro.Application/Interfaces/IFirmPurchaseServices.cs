using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Filters;
using PharmacyPro.Application.Responses;

namespace PharmacyPro.Application.Interfaces;

public interface IFirmPurchaseService
{
    Task<PagedResponse<FirmPurchaseDto>> GetAllAsync(FirmPurchaseFilter filter);
    Task<Response<FirmPurchaseDto>> GetByIdAsync(int id);
    Task<Response<FirmPurchaseDto>> CreateAsync(CreateFirmPurchaseDto dto);
    Task<Response<FirmPurchaseDto>> UpdateAsync(int id, UpdateFirmPurchaseDto dto);
    Task<Response<bool>> DeleteAsync(int id);
}

public interface IFirmBalanceService
{
    Task<Response<FirmBalancesDto>> GetBalancesAsync();
}
