using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PharmacyPro.Domain.Entities;
using PharmacyPro.Infrastructure.Identity;

namespace PharmacyPro.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Firm> Firms => Set<Firm>();
    public DbSet<FirmPayment> FirmPayments => Set<FirmPayment>();
    public DbSet<FirmPurchase> FirmPurchases => Set<FirmPurchase>();
    public DbSet<FirmPurchaseItem> FirmPurchaseItems => Set<FirmPurchaseItem>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
