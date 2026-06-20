using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WorldLocations.Models;

/// <summary>
/// Represents a single world location loaded from the JSON source and persisted
/// as an entity in the EF Core database.
/// </summary>
public class Location
{
    [Key]
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("cityName")]
    public string CityName { get; set; } = string.Empty;

    [JsonPropertyName("countryName")]
    public string CountryName { get; set; } = string.Empty;

    [JsonPropertyName("population")]
    public int Population { get; set; }
}
