using WorldLocations.Data;
using WorldLocations.Models;

namespace WorldLocations.Repositories;

/// <summary>
/// EF Core-backed implementation of <see cref="ILocationRepository"/>.
/// </summary>
public class LocationRepository(LocationDbContext dbContext) : ILocationRepository
{
    public void AddRange(IEnumerable<Location> locations)
    {
        dbContext.Locations.AddRange(locations);
        dbContext.SaveChanges();
    }

    public List<Location> GetAll() => [.. dbContext.Locations];

    public int Count() => dbContext.Locations.Count();
}
