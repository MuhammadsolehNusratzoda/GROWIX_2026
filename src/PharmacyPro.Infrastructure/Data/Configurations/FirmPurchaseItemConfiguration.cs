using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Infrastructure.Data.Configurations;

public class FirmPurchaseItemConfiguration : IEntityTypeConfiguration<FirmPurchaseItem>
{
    public void Configure(EntityTypeBuilder<FirmPurchaseItem> b)
    {
        // Агар харид нест шавад (soft delete), сатрҳояш ҳам аз ҳисоб мебароянд
        b.HasQueryFilter(x => !x.IsDeleted && !x.FirmPurchase.IsDeleted);
        b.Property(x => x.UnitCost).HasPrecision(18, 2);
        b.HasIndex(x => x.ProductId);
        b.HasOne(x => x.FirmPurchase).WithMany(p => p.Items)
            .HasForeignKey(x => x.FirmPurchaseId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.Product).WithMany()
            .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
