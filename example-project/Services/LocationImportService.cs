using System.Text.Json;
using WorldLocations.Models;

namespace WorldLocations.Services;

/// <summary>
/// Reads and deserializes the <c>Data/locations.json</c> file that ships next to
/// the application binaries.
/// </summary>
public class LocationImportService : ILocationImportService
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _jsonFilePath =
        Path.Combine(AppContext.BaseDirectory, "Data", "locations.json");

    public List<Location> LoadFromJson()
    {
        if (!File.Exists(_jsonFilePath))
        {
            throw new FileNotFoundException(
                $"Could not find the locations data file at '{_jsonFilePath}'.",
                _jsonFilePath);
        }

        string json = File.ReadAllText(_jsonFilePath);
        List<Location>? locations = JsonSerializer.Deserialize<List<Location>>(json, SerializerOptions);

        return locations ?? [];
    }
}
