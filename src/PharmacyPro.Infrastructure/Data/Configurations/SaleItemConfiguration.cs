using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Infrastructure.Data.Configurations;

public class SaleItemConfiguration : IEntityTypeConfiguration<SaleItem>
{
    public void Configure(EntityTypeBuilder<SaleItem> b)
    {
        // Агар фурӯш нест шавад (soft delete), сатрҳояш ҳам аз ҳисоб мебароянд ва анбор барқарор мешавад
        b.HasQueryFilter(x => !x.IsDeleted && !x.Sale.IsDeleted);
        b.Property(x => x.UnitPrice).HasPrecision(18, 2);
        b.HasIndex(x => x.ProductId);
        b.HasIndex(x => x.FirmId);
        b.HasOne(x => x.Sale).WithMany(s => s.Items)
            .HasForeignKey(x => x.SaleId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Product).WithMany()
            .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
