using WorldLocations.Models;
using WorldLocations.Repositories;

namespace WorldLocations.Services;

/// <summary>
/// Orchestrates the end-to-end flow: import from JSON, persist to the database,
/// retrieve the stored records, and print them to the console.
/// </summary>
public class LocationService(
    ILocationImportService importService,
    ILocationRepository repository) : ILocationService
{
    public void ImportAndDisplay()
    {
        List<Location> imported = importService.LoadFromJson();
        repository.AddRange(imported);

        List<Location> stored = repository.GetAll();

        Console.WriteLine($"Loaded {repository.Count()} world locations from the database:");
        Console.WriteLine();

        foreach (Location location in stored)
        {
            Console.WriteLine($"Id:         {location.Id}");
            Console.WriteLine($"City:       {location.CityName}");
            Console.WriteLine($"Country:    {location.CountryName}");
            Console.WriteLine($"Population: {location.Population:N0}");
            Console.WriteLine(new string('-', 40));
        }
    }
}
