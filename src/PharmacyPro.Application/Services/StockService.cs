using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

public class StockService(
    IRepository<Product> productRepo,
    IRepository<FirmPurchaseItem> purchaseItems,
    IRepository<SaleItem> saleItems) : IStockService
{
    public async Task<Dictionary<int, int>> GetOnHandAsync(IEnumerable<int> productIds)
    {
        var ids = productIds.Distinct().ToList();
        var result = ids.ToDictionary(id => id, _ => 0);
        if (ids.Count == 0) return result;

        var bought = await purchaseItems.Query()
            .Where(i => ids.Contains(i.ProductId))
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Qty = g.Sum(x => x.Quantity) })
            .ToListAsync();

        var sold = await saleItems.Query()
            .Where(i => ids.Contains(i.ProductId))
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Qty = g.Sum(x => x.Quantity) })
            .ToListAsync();

        foreach (var b in bought) result[b.ProductId] += b.Qty;
        foreach (var s in sold) result[s.ProductId] -= s.Qty;
        return result;
    }

    public async Task<Response<StockReportDto>> GetReportAsync()
    {
        var products = await productRepo.Query().Include(p => p.Firm).ToListAsync();
        var onHand = await GetOnHandAsync(products.Select(p => p.Id));

        var firms = products
            .Select(p => new { Product = p, Qty = onHand[p.Id] })
            .Where(x => x.Qty > 0)
            .GroupBy(x => x.Product.FirmId)
            .Select(g =>
            {
                var firm = g.First().Product.Firm;
                var items = g
                    .Select(x => new StockItemDto(
                        x.Product.Id, x.Product.Name, x.Qty,
                        x.Product.PurchasePrice, x.Product.SalePrice,
                        x.Qty * x.Product.PurchasePrice, x.Qty * x.Product.SalePrice))
                    .OrderByDescending(i => i.ValueAtCost)
                    .ToList();

                return new FirmStockDto(
                    firm.Id, firm.Name,
                    items.Sum(i => i.QuantityOnHand),
                    items.Sum(i => i.ValueAtCost),
                    items.Sum(i => i.ValueAtSale),
                    items);
            })
            .OrderByDescending(f => f.TotalValueAtCost)
            .ToList();

        return Response<StockReportDto>.Success(new StockReportDto(
            firms.Sum(f => f.TotalValueAtCost),
            firms.Sum(f => f.TotalValueAtSale),
            firms));
    }
}
