using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.Common;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Filters;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

public class FirmPurchaseService(
    IRepository<FirmPurchase> repo,
    IRepository<Firm> firmRepo) : IFirmPurchaseService
{
    public async Task<PagedResponse<FirmPurchaseDto>> GetAllAsync(FirmPurchaseFilter filter)
    {
        var q = repo.Query().Include(p => p.Firm).AsQueryable();

        if (filter.FirmId.HasValue) q = q.Where(p => p.FirmId == filter.FirmId.Value);
        if (filter.From.HasValue) q = q.Where(p => p.PurchaseDate >= filter.From.Value.ToUtc());
        if (filter.To.HasValue) q = q.Where(p => p.PurchaseDate < filter.To.Value.EndExclusive());

        return await q.OrderByDescending(p => p.PurchaseDate).ToPagedAsync(filter, p => p.ToDto());
    }

    public async Task<Response<FirmPurchaseDto>> GetByIdAsync(int id)
    {
        var p = await repo.Query().Include(x => x.Firm).FirstOrDefaultAsync(x => x.Id == id);
        return p is null
            ? Response<FirmPurchaseDto>.Fail("Харид ёфт нашуд", 404)
            : Response<FirmPurchaseDto>.Success(p.ToDto());
    }

    public async Task<Response<FirmPurchaseDto>> CreateAsync(CreateFirmPurchaseDto dto)
    {
        var firm = await firmRepo.GetByIdAsync(dto.FirmId);
        if (firm is null) return Response<FirmPurchaseDto>.Fail("Фирма ёфт нашуд", 404);

        var p = await repo.AddAsync(new FirmPurchase
        {
            FirmId = dto.FirmId,
            Amount = dto.Amount,
            PurchaseDate = dto.PurchaseDate.ToUtc(),
            InvoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber) ? null : dto.InvoiceNumber.Trim(),
            Note = dto.Note
        });
        p.Firm = firm;

        return Response<FirmPurchaseDto>.Success(p.ToDto(), "Дору аз фирма сабт шуд", 201);
    }

    public async Task<Response<FirmPurchaseDto>> UpdateAsync(int id, UpdateFirmPurchaseDto dto)
    {
        var p = await repo.Query().Include(x => x.Firm).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return Response<FirmPurchaseDto>.Fail("Харид ёфт нашуд", 404);

        var firm = await firmRepo.GetByIdAsync(dto.FirmId);
        if (firm is null) return Response<FirmPurchaseDto>.Fail("Фирма ёфт нашуд", 404);

        p.FirmId = dto.FirmId;
        p.Firm = firm;
        p.Amount = dto.Amount;
        p.PurchaseDate = dto.PurchaseDate.ToUtc();
        p.InvoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber) ? null : dto.InvoiceNumber.Trim();
        p.Note = dto.Note;

        await repo.UpdateAsync(p);
        return Response<FirmPurchaseDto>.Success(p.ToDto(), "Харид тағйир ёфт");
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return Response<bool>.Fail("Харид ёфт нашуд", 404);

        await repo.DeleteAsync(p);
        return Response<bool>.Success(true, "Харид нест карда шуд");
    }
}
