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
    IRepository<FirmPurchaseItem> purchaseItems,
    IRepository<Firm> firmRepo,
    IRepository<Product> productRepo,
    IStockService stock) : IFirmPurchaseService
{
    private IQueryable<FirmPurchase> WithDetails() =>
        repo.Query()
            .Include(p => p.Firm)
            .Include(p => p.Items)
            .ThenInclude(i => i.Product)
            .AsQueryable();

    public async Task<PagedResponse<FirmPurchaseDto>> GetAllAsync(FirmPurchaseFilter filter)
    {
        var q = WithDetails();

        if (filter.FirmId.HasValue) q = q.Where(p => p.FirmId == filter.FirmId.Value);
        if (filter.From.HasValue) q = q.Where(p => p.PurchaseDate >= filter.From.Value.ToUtc());
        if (filter.To.HasValue) q = q.Where(p => p.PurchaseDate < filter.To.Value.EndExclusive());

        return await q.OrderByDescending(p => p.PurchaseDate).ToPagedAsync(filter, p => p.ToDto());
    }

    public async Task<Response<FirmPurchaseDto>> GetByIdAsync(int id)
    {
        var p = await WithDetails().FirstOrDefaultAsync(x => x.Id == id);
        return p is null
            ? Response<FirmPurchaseDto>.Fail("Харид ёфт нашуд", 404)
            : Response<FirmPurchaseDto>.Success(p.ToDto());
    }

    public async Task<Response<FirmPurchaseDto>> CreateAsync(CreateFirmPurchaseDto dto)
    {
        var firm = await firmRepo.GetByIdAsync(dto.FirmId);
        if (firm is null) return Response<FirmPurchaseDto>.Fail("Фирма ёфт нашуд", 404);

        var purchase = new FirmPurchase
        {
            FirmId = dto.FirmId,
            PurchaseDate = dto.PurchaseDate.ToUtc(),
            InvoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber) ? null : dto.InvoiceNumber.Trim(),
            Note = dto.Note
        };

        var inputs = dto.Items ?? new List<FirmPurchaseItemInputDto>();
        var products = new List<Product>();

        if (inputs.Count > 0)
        {
            var ids = inputs.Select(i => i.ProductId).Distinct().ToList();
            products = await productRepo.Query().Where(p => ids.Contains(p.Id)).ToListAsync();

            if (products.Count != ids.Count)
                return Response<FirmPurchaseDto>.Fail("Маҳсулот ёфт нашуд", 404);

            var foreign = products.FirstOrDefault(p => p.FirmId != dto.FirmId);
            if (foreign is not null)
                return Response<FirmPurchaseDto>.Fail($"Маҳсулоти «{foreign.Name}» ба ин фирма тааллуқ надорад", 400);

            foreach (var i in inputs)
            {
                purchase.Items.Add(new FirmPurchaseItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitCost = i.UnitCost
                });
            }
            purchase.Amount = Math.Round(purchase.Items.Sum(i => i.Quantity * i.UnitCost), 2);
            if (purchase.Amount <= 0)
                return Response<FirmPurchaseDto>.Fail("Маблағи харид бояд аз 0 зиёд бошад", 400);
        }
        else
        {
            if (dto.Amount <= 0)
                return Response<FirmPurchaseDto>.Fail("Маблағ ё маҳсулот лозим аст", 400);
            purchase.Amount = dto.Amount;
        }

        var saved = await repo.AddAsync(purchase);
        saved.Firm = firm;
        foreach (var item in saved.Items)
            item.Product = products.First(p => p.Id == item.ProductId);

        return Response<FirmPurchaseDto>.Success(saved.ToDto(), "Мол аз фирма сабт шуд", 201);
    }

    public async Task<Response<FirmPurchaseDto>> UpdateAsync(int id, UpdateFirmPurchaseDto dto)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return Response<FirmPurchaseDto>.Fail("Харид ёфт нашуд", 404);

        var hasItems = await purchaseItems.Query().AnyAsync(i => i.FirmPurchaseId == id);

        if (hasItems)
        {
            // Харид бо маҳсулот: фирма ва маблағро иваз кардан мумкин нест (анбор вобаста аст)
            if (dto.FirmId != p.FirmId)
                return Response<FirmPurchaseDto>.Fail("Харид бо маҳсулот аст, фирмаашро иваз кардан мумкин нест", 409);
        }
        else
        {
            var firm = await firmRepo.GetByIdAsync(dto.FirmId);
            if (firm is null) return Response<FirmPurchaseDto>.Fail("Фирма ёфт нашуд", 404);
            p.FirmId = dto.FirmId;
            p.Amount = dto.Amount;
        }

        p.PurchaseDate = dto.PurchaseDate.ToUtc();
        p.InvoiceNumber = string.IsNullOrWhiteSpace(dto.InvoiceNumber) ? null : dto.InvoiceNumber.Trim();
        p.Note = dto.Note;

        await repo.UpdateAsync(p);
        return await GetByIdAsync(id);
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return Response<bool>.Fail("Харид ёфт нашуд", 404);

        // Агар аз ин мол аллакай фурӯхта шуда бошад, нест кардан анборро манфӣ мекунад
        var items = await purchaseItems.Query().Where(i => i.FirmPurchaseId == id).ToListAsync();
        if (items.Count > 0)
        {
            var onHand = await stock.GetOnHandAsync(items.Select(i => i.ProductId));
            foreach (var g in items.GroupBy(i => i.ProductId))
            {
                if (onHand[g.Key] - g.Sum(x => x.Quantity) < 0)
                    return Response<bool>.Fail("Ин харидро нест кардан мумкин нест: қисми мол аллакай фурӯхта шудааст", 409);
            }
        }

        await repo.DeleteAsync(p);
        return Response<bool>.Success(true, "Харид нест карда шуд");
    }
}
