using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WorldLocations.Data;
using WorldLocations.Repositories;
using WorldLocations.Services;

ServiceCollection services = new();

services.AddDbContext<LocationDbContext>(options =>
    options.UseInMemoryDatabase("WorldLocationsDb"));

services.AddScoped<ILocationRepository, LocationRepository>();
services.AddScoped<ILocationImportService, LocationImportService>();
services.AddScoped<ILocationService, LocationService>();

using ServiceProvider provider = services.BuildServiceProvider();

// Recreate and reseed the database on every run for deterministic behavior.
LocationDbContext dbContext = provider.GetRequiredService<LocationDbContext>();
dbContext.Database.EnsureDeleted();
dbContext.Database.EnsureCreated();

ILocationService locationService = provider.GetRequiredService<ILocationService>();
locationService.ImportAndDisplay();
