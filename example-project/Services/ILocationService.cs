namespace WorldLocations.Services;

/// <summary>
/// Coordinates importing locations from JSON, persisting them to the database,
/// and printing the stored records to the console.
/// </summary>
public interface ILocationService
{
    void ImportAndDisplay();
}
