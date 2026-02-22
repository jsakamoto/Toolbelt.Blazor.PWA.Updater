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
    static BunitContext CreateContext(Platform platform, string environment)
    {
        var ctx = new BunitContext();
        ctx.Services.TryAddScoped<PWAUpdaterService>();
        ctx.Services.TryAddScoped<IPWAUpdaterService>(sp => sp.GetRequiredService<PWAUpdaterService>());
        switch (platform)
        {
            case Platform.BlazorServer:
                ctx.Services.RemoveAll<IHostEnvironment>();
                ctx.Services.AddScoped<IHostEnvironment>(_ => new HostEnv(environment));
                break;
            case Platform.BlazorWebAssembly:
                ctx.Services.RemoveAll<IWebAssemblyHostEnvironment>();
                ctx.Services.AddScoped<IWebAssemblyHostEnvironment>(_ => new WasmHostEnv(environment));
                break;
            default: throw new NotImplementedException();
        }
        return ctx;
    }

    private static readonly IEnumerable<Platform> _Platfoems = new[] {
        Platform.BlazorServer,
        Platform.BlazorWebAssembly };

    private static readonly IEnumerable<IEnumerable<object>> _TestCases1 = _Platfoems.SelectMany(platform => (new object[][] {
        ["Production", true],
        ["Development", false], }
    ).Select(pattern => pattern.Prepend(platform).ToArray()));

    [TestCaseSource(nameof(_TestCases1))]
    public void Visibility_by_Environment_with_DefaultParams_Test(Platform platform, string hostEnv, bool expectedVisible)
    {
        // Given
        using var ctx = CreateContext(platform, hostEnv);
        var cut = ctx.Render<PWAUpdater>();
        cut.FindAll(".pwa-updater").Count.Is(0); // Verify that the PWAUpdater will never render anything at first.

        // When
        ctx.Services.GetRequiredService<PWAUpdaterService>().OnNextVersionIsWaiting();

        // Then
        if (expectedVisible)
            cut.WaitForState(() => cut.Find(".pwa-updater").ClassList.Contains("visible"));
        else
            cut.FindAll(".pwa-updater").Count.Is(0);
    }

    private static readonly IEnumerable<IEnumerable<object>> _TestCases2 = _Platfoems.SelectMany(platform => (new object[][] {
        ["Production", "", true],
        ["Development", "", true],
        ["Production", "Development", false],
        ["Development", "Development", true],
        ["EnvA", "EnvA,EnvB", true],
        ["EnvB", "EnvA, EnvB", true],
        ["EnvC", "EnvA,EnvB", false], }
    ).Select(pattern => pattern.Prepend(platform).ToArray()));

    [TestCaseSource(nameof(_TestCases2))]
    public void Visibility_by_Environment_and_EnvForWorkParam_Test(Platform platform, string hostEnv, string envForWork, bool expectedVisible)
    {
        // Given
        using var ctx = CreateContext(platform, hostEnv);
        var cut = ctx.Render<PWAUpdater>(param => param.Add(_ => _.EnvironmentsForWork, envForWork));
        cut.FindAll(".pwa-updater").Count.Is(0); // Verify that the PWAUpdater will never render anything at first.

        // When
        ctx.Services.GetRequiredService<PWAUpdaterService>().OnNextVersionIsWaiting();

        // Then
        if (expectedVisible)
            cut.WaitForState(() => cut.Find(".pwa-updater").ClassList.Contains("visible"));
        else
            cut.FindAll(".pwa-updater").Count.Is(0);
    }
}