using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Toolbelt.Blazor.PWA.Updater.Service;

namespace Toolbelt.Blazor.Extensions.DependencyInjection;

public static class PWAExtensions
{
    /// <summary>
    ///  Adds a PWA Updater service to the specified Microsoft.Extensions.DependencyInjection.IServiceCollection.
    /// </summary>
    /// <param name="services">The Microsoft.Extensions.DependencyInjection.IServiceCollection to add the service to.</param>
    public static IServiceCollection AddPWAUpdater(this IServiceCollection services)
    {
        services.TryAddScoped<IPWAUpdaterService, PWAUpdaterService>();
        return services;
    }
}
