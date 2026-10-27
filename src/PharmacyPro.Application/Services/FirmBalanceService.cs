using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

// Қарз ба фирма = ҷамъи моли гирифташуда − ҷамъи пардохтҳо (барои тамоми вақт).
// Фурӯши маҳсулоти фирма қарзро ХУДКОР кам намекунад: он алоҳида сабт мешавад (TotalSold),
// ва қарз танҳо вақте кам мешавад, ки админ пардохт сабт кунад.
public class FirmBalanceService(
    IRepository<Firm> firmRepo,
    IRepository<FirmPurchase> purchaseRepo,
    IRepository<FirmPayment> paymentRepo,
    IRepository<SaleItem> saleItems) : IFirmBalanceService
{
    public async Task<Response<FirmBalancesDto>> GetBalancesAsync()
    {
        var firms = await firmRepo.Query()
            .OrderBy(f => f.Name)
            .Select(f => new { f.Id, f.Name, f.Phone })
            .ToListAsync();

        var purchasedRows = await purchaseRepo.Query()
            .GroupBy(p => p.FirmId)
            .Select(g => new { FirmId = g.Key, Total = g.Sum(x => x.Amount) })
            .ToListAsync();

        var paidRows = await paymentRepo.Query()
            .GroupBy(p => p.FirmId)
            .Select(g => new { FirmId = g.Key, Total = g.Sum(x => x.Amount) })
            .ToListAsync();

        var soldRows = await saleItems.Query()
            .GroupBy(i => i.FirmId)
            .Select(g => new { FirmId = g.Key, Total = g.Sum(x => x.Quantity * x.UnitPrice) })
            .ToListAsync();

        var purchased = purchasedRows.ToDictionary(x => x.FirmId, x => x.Total);
        var paid = paidRows.ToDictionary(x => x.FirmId, x => x.Total);
        var sold = soldRows.ToDictionary(x => x.FirmId, x => x.Total);

        var list = firms
            .Select(f =>
            {
                var bought = purchased.GetValueOrDefault(f.Id);
                var payed = paid.GetValueOrDefault(f.Id);
                var sales = sold.GetValueOrDefault(f.Id);
                return new FirmBalanceDto(
                    f.Id, f.Name, f.Phone,
                    bought, sales, payed,
                    bought - payed,
                    Math.Max(0, sales - payed));
            })
            .OrderByDescending(x => x.Debt)
            .ThenBy(x => x.FirmName)
            .ToList();

        var totalDebt = list.Where(x => x.Debt > 0).Sum(x => x.Debt);

        return Response<FirmBalancesDto>.Success(new FirmBalancesDto(totalDebt, list));
    }
}
