using WorldLocations.Models;

namespace WorldLocations.Repositories;

/// <summary>
/// Abstraction over persistence for <see cref="Location"/> entities.
/// </summary>
public interface ILocationRepository
{
    void AddRange(IEnumerable<Location> locations);

    List<Location> GetAll();

    int Count();
}
