using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.Common;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

// Кадом маҳсулоти як фирма чанд дона ва ба чанд сомонӣ фурӯхта шуд
public class FirmLedgerService(
    IRepository<Firm> firmRepo,
    IRepository<SaleItem> saleItems) : IFirmLedgerService
{
    public async Task<Response<FirmLedgerDto>> GetAsync(int firmId, DateTime? from, DateTime? to)
    {
        var firm = await firmRepo.GetByIdAsync(firmId);
        if (firm is null) return Response<FirmLedgerDto>.Fail("Фирма ёфт нашуд", 404);

        var q = saleItems.Query().Where(i => i.FirmId == firmId);
        if (from.HasValue) q = q.Where(i => i.Sale.SaleDate >= from.Value.ToUtc());
        if (to.HasValue) q = q.Where(i => i.Sale.SaleDate < to.Value.EndExclusive());

        var rows = await q
            .GroupBy(i => new { i.ProductId, i.Product.Name })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.Name,
                Qty = g.Sum(x => x.Quantity),
                Amount = g.Sum(x => x.Quantity * x.UnitPrice)
            })
            .ToListAsync();

        var items = rows
            .Select(r => new FirmSoldItemDto(r.ProductId, r.Name, r.Qty, r.Amount))
            .OrderByDescending(i => i.Amount)
            .ToList();

        return Response<FirmLedgerDto>.Success(new FirmLedgerDto(
            firm.Id, firm.Name, from, to,
            items.Sum(i => i.Quantity), items.Sum(i => i.Amount), items));
    }
}
