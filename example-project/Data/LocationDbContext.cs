using Microsoft.EntityFrameworkCore;
using WorldLocations.Models;

namespace WorldLocations.Data;

/// <summary>
/// EF Core database context that exposes the persisted world locations.
/// </summary>
public class LocationDbContext(DbContextOptions<LocationDbContext> options) : DbContext(options)
{
    public DbSet<Location> Locations => Set<Location>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(location => location.Id);
            entity.Property(location => location.CityName).IsRequired();
            entity.Property(location => location.CountryName).IsRequired();
        });
    }
}
