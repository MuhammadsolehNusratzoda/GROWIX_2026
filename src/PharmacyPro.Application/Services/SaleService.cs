using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.Common;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Filters;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

public class SaleService(
    IRepository<Sale> repo,
    IRepository<SaleItem> saleItems,
    IRepository<Product> productRepo,
    IStockService stock,
    ICurrentUserService currentUser,
    ReportCache reportCache) : ISaleService
{
    private IQueryable<Sale> WithItems() =>
        repo.Query()
            .Include(s => s.Items)
            .ThenInclude(i => i.Product)
            .ThenInclude(p => p.Firm)
            .AsQueryable();

    public async Task<PagedResponse<SaleDto>> GetAllAsync(SaleFilter filter)
    {
        var q = WithItems();

        if (filter.From.HasValue) q = q.Where(s => s.SaleDate >= filter.From.Value.ToUtc());
        if (filter.To.HasValue) q = q.Where(s => s.SaleDate < filter.To.Value.EndExclusive());
        if (filter.Method.HasValue) q = q.Where(s => s.Method == filter.Method.Value);
        if (filter.MinAmount.HasValue) q = q.Where(s => s.Amount >= filter.MinAmount.Value);
        if (filter.MaxAmount.HasValue) q = q.Where(s => s.Amount <= filter.MaxAmount.Value);

        return await q.OrderByDescending(s => s.SaleDate).ToPagedAsync(filter, s => s.ToDto());
    }

    public async Task<Response<SaleDto>> GetByIdAsync(int id)
    {
        var sale = await WithItems().FirstOrDefaultAsync(s => s.Id == id);
        return sale is null
            ? Response<SaleDto>.Fail("Фурӯш ёфт нашуд", 404)
            : Response<SaleDto>.Success(sale.ToDto());
    }

    public async Task<Response<SaleDto>> CreateAsync(CreateSaleDto dto)
    {
        if (currentUser.UserId is null) return Response<SaleDto>.Fail("Ворид нашудаед", 401);

        var sale = new Sale
        {
            SaleDate = dto.SaleDate.ToUtc(),
            Method = dto.Method,
            Note = dto.Note,
            CreatedByUserId = currentUser.UserId
        };

        var inputs = dto.Items ?? new List<SaleItemInputDto>();
        var products = new List<Product>();

        if (inputs.Count > 0)
        {
            var ids = inputs.Select(i => i.ProductId).Distinct().ToList();
            products = await productRepo.Query()
                .Include(p => p.Firm)
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            if (products.Count != ids.Count)
                return Response<SaleDto>.Fail("Маҳсулот ёфт нашуд", 404);

            var inactive = products.FirstOrDefault(p => !p.IsActive);
            if (inactive is not null)
                return Response<SaleDto>.Fail($"Маҳсулоти «{inactive.Name}» ғайрифаъол аст", 400);

            // Анбор: аз миқдори мавҷуда зиёд фурӯхтан мумкин нест
            var onHand = await stock.GetOnHandAsync(ids);
            foreach (var g in inputs.GroupBy(i => i.ProductId))
            {
                var need = g.Sum(x => x.Quantity);
                var have = onHand[g.Key];
                if (need > have)
                {
                    var name = products.First(p => p.Id == g.Key).Name;
                    return Response<SaleDto>.Fail($"Дар анбор барои «{name}» танҳо {have} дона ҳаст, {need} дона талаб шуд", 409);
                }
            }

            foreach (var i in inputs)
            {
                var product = products.First(p => p.Id == i.ProductId);
                sale.Items.Add(new SaleItem
                {
                    ProductId = product.Id,
                    FirmId = product.FirmId,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                });
            }
            sale.Amount = Math.Round(sale.Items.Sum(i => i.Quantity * i.UnitPrice), 2);
            if (sale.Amount <= 0)
                return Response<SaleDto>.Fail("Маблағи фурӯш бояд аз 0 зиёд бошад", 400);
        }
        else
        {
            if (dto.Amount <= 0)
                return Response<SaleDto>.Fail("Маблағ ё маҳсулот лозим аст", 400);
            sale.Amount = dto.Amount;
        }

        var saved = await repo.AddAsync(sale);

        foreach (var item in saved.Items)
            item.Product = products.First(p => p.Id == item.ProductId);

        reportCache.Invalidate(saved.SaleDate);
        return Response<SaleDto>.Success(saved.ToDto(), "Фурӯш сабт шуд", 201);
    }

    public async Task<Response<SaleDto>> UpdateAsync(int id, UpdateSaleDto dto)
    {
        var sale = await repo.GetByIdAsync(id);
        if (sale is null) return Response<SaleDto>.Fail("Фурӯш ёфт нашуд", 404);

        var hasItems = await saleItems.Query().AnyAsync(i => i.SaleId == id);

        reportCache.Invalidate(sale.SaleDate); // санаи кӯҳна
        // Фурӯш бо маҳсулот: маблағ аз сатрҳо меояд, онро дастӣ иваз намекунем
        if (!hasItems) sale.Amount = dto.Amount;
        sale.SaleDate = dto.SaleDate.ToUtc();
        sale.Method = dto.Method;
        sale.Note = dto.Note;

        await repo.UpdateAsync(sale);
        reportCache.Invalidate(sale.SaleDate); // санаи нав

        return await GetByIdAsync(id);
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        var sale = await repo.GetByIdAsync(id);
        if (sale is null) return Response<bool>.Fail("Фурӯш ёфт нашуд", 404);

        // Сатрҳои фурӯш бо query filter пинҳон мешаванд ва анбор худкор барқарор мешавад
        await repo.DeleteAsync(sale);
        reportCache.Invalidate(sale.SaleDate);
        return Response<bool>.Success(true, "Фурӯш нест карда шуд");
    }
}
