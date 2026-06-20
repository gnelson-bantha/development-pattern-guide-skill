using WorldLocations.Models;

namespace WorldLocations.Services;

/// <summary>
/// Loads world locations from the JSON source file.
/// </summary>
public interface ILocationImportService
{
    List<Location> LoadFromJson();
}
