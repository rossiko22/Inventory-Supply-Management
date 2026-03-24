using Microsoft.EntityFrameworkCore;
using order_service.Domain;

namespace order_service.Infrastructure.Persistence;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options):
        base(options){}
    
    public DbSet<Order> Orders { get; set; }
}