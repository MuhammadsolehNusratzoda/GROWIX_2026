using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PharmacyPro.Domain.Entities;

namespace PharmacyPro.Infrastructure.Data.Configurations;

public class FirmPurchaseConfiguration : IEntityTypeConfiguration<FirmPurchase>
{
    public void Configure(EntityTypeBuilder<FirmPurchase> b)
    {
        b.HasQueryFilter(x => !x.IsDeleted);
        b.Property(x => x.Amount).HasPrecision(18, 2);
        b.Property(x => x.InvoiceNumber).HasMaxLength(50);
        b.Property(x => x.Note).HasMaxLength(500);
        b.HasIndex(x => x.PurchaseDate);
        b.HasOne(x => x.Firm).WithMany()
            .HasForeignKey(x => x.FirmId).OnDelete(DeleteBehavior.Restrict);
    }
}
