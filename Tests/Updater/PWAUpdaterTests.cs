using Bunit;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Toolbelt.Blazor.PWA.Updater.Service;
using Toolbelt.Blazor.PWA.Updater.Test.Fixtures;

namespace Toolbelt.Blazor.PWA.Updater.Test;

public class PWAUpdaterTests
{
    static Bunit.TestContext CreateContext(Platform platform, string environment)
    {
        var ctx = new Bunit.TestContext();
        ctx.Services.TryAddScoped<PWAUpdaterService>();
        ctx.Services.TryAddScoped<IPWAUpdaterService>(sp => sp.GetRequiredService<PWAUpdaterService>());
        switch (platform)
        {
            case Platform.BlazorServer:
                ctx.Services.TryAddScoped<IHostEnvironment>(_ => new HostEnv(environment));
                break;
            case Platform.BlazorWebAssembly:
                ctx.Services.TryAddScoped<IWebAssemblyHostEnvironment>(_ => new WasmHostEnv(environment));
                break;
            default: throw new NotImplementedException();
        }
        return ctx;
    }

    private static readonly IEnumerable<Platform> _Platfoems = new[] {
        Platform.BlazorServer,
        Platform.BlazorWebAssembly };

    private static readonly IEnumerable<IEnumerable<object>> _TestCases1 = _Platfoems.SelectMany(platform => (new object[][] {
        new object[] {"Production", true },
        new object[] {"Development", false }, }
    ).Select(pattern => pattern.Prepend(platform).ToArray()));

    [TestCaseSource(nameof(_TestCases1))]
    public void Visibility_by_Environment_with_DefaultParams_Test(Platform platform, string hostEnv, bool expectedVisible)
    {
        // Given
        using var ctx = CreateContext(platform, hostEnv);

        var cut = ctx.RenderComponent<PWAUpdater>();
        cut.Find(".pwa-updater").ClassList.Contains("visible").IsFalse();

        // When
        ctx.Services.GetRequiredService<PWAUpdaterService>().OnNextVersionIsWaiting();

        // Then
        cut.Find(".pwa-updater").ClassList.Contains("visible").Is(expectedVisible);
    }

    private static readonly IEnumerable<IEnumerable<object>> _TestCases2 = _Platfoems.SelectMany(platform => (new object[][] {
        new object[] {"Production", "", true },
        new object[] {"Development", "", true },
        new object[] {"Production", "Development", false },
        new object[] {"Development", "Development", true },
        new object[] {"EnvA", "EnvA,EnvB", true },
        new object[] {"EnvB", "EnvA, EnvB", true },
        new object[] {"EnvC", "EnvA,EnvB", false }, }
    ).Select(pattern => pattern.Prepend(platform).ToArray()));

    [TestCaseSource(nameof(_TestCases2))]
    public void Visibility_by_Environment_and_EnvForWorkParam_Test(Platform platform, string hostEnv, string envForWork, bool expectedVisible)
    {
        // Given
        using var ctx = CreateContext(platform, hostEnv);

        var cut = ctx.RenderComponent<PWAUpdater>(param => param.Add(_ => _.EnvironmentsForWork, envForWork));
        cut.Find(".pwa-updater").ClassList.Contains("visible").IsFalse();

        // When
        ctx.Services.GetRequiredService<PWAUpdaterService>().OnNextVersionIsWaiting();

        // Then
        cut.Find(".pwa-updater").ClassList.Contains("visible").Is(expectedVisible);
    }
}