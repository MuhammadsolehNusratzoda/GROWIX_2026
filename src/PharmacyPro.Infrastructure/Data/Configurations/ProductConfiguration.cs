using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.HasQueryFilter(x => !x.IsDeleted);
        b.Property(x => x.Name).IsRequired().HasMaxLength(150);
        b.Property(x => x.PurchasePrice).HasPrecision(18, 2);
        b.Property(x => x.SalePrice).HasPrecision(18, 2);
        b.HasIndex(x => new { x.FirmId, x.Name }).IsUnique().HasFilter("\"IsDeleted\" = false");
        b.HasOne(x => x.Firm).WithMany()
            .HasForeignKey(x => x.FirmId).OnDelete(DeleteBehavior.Restrict);
    }
}
