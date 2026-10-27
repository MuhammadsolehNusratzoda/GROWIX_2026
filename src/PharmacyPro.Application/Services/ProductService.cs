using Microsoft.EntityFrameworkCore;
using PharmacyPro.Application.Common;
using PharmacyPro.Application.DTOs;
using PharmacyPro.Application.Filters;
using PharmacyPro.Application.Interfaces;
using PharmacyPro.Application.Responses;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Application.Services;

public class ProductService(
    IRepository<Product> repo,
    IRepository<Firm> firmRepo,
    IRepository<FirmPurchaseItem> purchaseItems,
    IRepository<SaleItem> saleItems,
    IStockService stock) : IProductService
{
    public async Task<PagedResponse<ProductDto>> GetAllAsync(ProductFilter filter)
    {
        var q = repo.Query().Include(p => p.Firm).AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(s));
        }
        if (filter.FirmId.HasValue) q = q.Where(p => p.FirmId == filter.FirmId.Value);
        if (filter.IsActive.HasValue) q = q.Where(p => p.IsActive == filter.IsActive.Value);

        var total = await q.CountAsync();
        var items = await q
            .OrderBy(p => p.Name)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var onHand = await stock.GetOnHandAsync(items.Select(p => p.Id));
        var dtos = items.Select(p => p.ToDto(onHand.GetValueOrDefault(p.Id))).ToList();

        return PagedResponse<ProductDto>.Create(dtos, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<Response<ProductDto>> GetByIdAsync(int id)
    {
        var p = await repo.Query().Include(x => x.Firm).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return Response<ProductDto>.Fail("Маҳсулот ёфт нашуд", 404);

        var onHand = await stock.GetOnHandAsync(new[] { p.Id });
        return Response<ProductDto>.Success(p.ToDto(onHand.GetValueOrDefault(p.Id)));
    }

    public async Task<Response<ProductDto>> CreateAsync(CreateProductDto dto)
    {
        var firm = await firmRepo.GetByIdAsync(dto.FirmId);
        if (firm is null) return Response<ProductDto>.Fail("Фирма ёфт нашуд", 404);

        var name = dto.Name.Trim();
        if (await repo.Query().AnyAsync(p => p.FirmId == dto.FirmId && p.Name.ToLower() == name.ToLower()))
            return Response<ProductDto>.Fail("Маҳсулот бо ин ном дар ин фирма аллакай ҳаст", 409);

        var p = await repo.AddAsync(new Product
        {
            Name = name,
            FirmId = dto.FirmId,
            PurchasePrice = dto.PurchasePrice,
            SalePrice = dto.SalePrice
        });
        p.Firm = firm;

        return Response<ProductDto>.Success(p.ToDto(0), "Маҳсулот илова шуд", 201);
    }

    public async Task<Response<ProductDto>> UpdateAsync(int id, UpdateProductDto dto)
    {
        var p = await repo.Query().Include(x => x.Firm).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return Response<ProductDto>.Fail("Маҳсулот ёфт нашуд", 404);

        var name = dto.Name.Trim();

        if (dto.FirmId != p.FirmId)
        {
            if (await HasHistoryAsync(id))
                return Response<ProductDto>.Fail("Маҳсулот таърих дорад, фирмаашро иваз кардан мумкин нест", 409);

            var firm = await firmRepo.GetByIdAsync(dto.FirmId);
            if (firm is null) return Response<ProductDto>.Fail("Фирма ёфт нашуд", 404);
            p.FirmId = dto.FirmId;
            p.Firm = firm;
        }

        if (await repo.Query().AnyAsync(x => x.Id != id && x.FirmId == p.FirmId && x.Name.ToLower() == name.ToLower()))
            return Response<ProductDto>.Fail("Маҳсулот бо ин ном дар ин фирма аллакай ҳаст", 409);

        p.Name = name;
        p.PurchasePrice = dto.PurchasePrice;
        p.SalePrice = dto.SalePrice;
        p.IsActive = dto.IsActive;

        await repo.UpdateAsync(p);

        var onHand = await stock.GetOnHandAsync(new[] { p.Id });
        return Response<ProductDto>.Success(p.ToDto(onHand.GetValueOrDefault(p.Id)), "Маҳсулот тағйир ёфт");
    }

    public async Task<Response<bool>> DeleteAsync(int id)
    {
        var p = await repo.GetByIdAsync(id);
        if (p is null) return Response<bool>.Fail("Маҳсулот ёфт нашуд", 404);

        if (await HasHistoryAsync(id))
            return Response<bool>.Fail("Маҳсулот таърихи харид ё фурӯш дорад. Ба ҷои нест кардан онро ғайрифаъол кунед", 409);

        await repo.DeleteAsync(p);
        return Response<bool>.Success(true, "Маҳсулот нест карда шуд");
    }

    private async Task<bool> HasHistoryAsync(int productId) =>
        await purchaseItems.Query().AnyAsync(i => i.ProductId == productId) ||
        await saleItems.Query().AnyAsync(i => i.ProductId == productId);
}
