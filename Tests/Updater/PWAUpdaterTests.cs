using Bunit;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Toolbelt.Blazor.PWA.Updater.Service;

namespace Toolbelt.Blazor.PWA.Updater.Test;

public class PWAUpdaterTests
{
    class DummyUpdaterService : IPWAUpdaterService
    {
        public event EventHandler? NextVersionIsWaiting;
        public ValueTask SkipWaitingAsync() => ValueTask.CompletedTask;
        public void InvokeNextVersionIsWaiting() => NextVersionIsWaiting?.Invoke(this, EventArgs.Empty);
    }

    record HostEnv(string Environment, string BaseAddress) : IWebAssemblyHostEnvironment;

    static (Bunit.TestContext, DummyUpdaterService) CreateContext(string environment)
    {
        var updaterService = new DummyUpdaterService();
        var ctx = new Bunit.TestContext();
        ctx.Services.TryAddScoped<IPWAUpdaterService>(_ => updaterService);
        ctx.Services.TryAddScoped<IWebAssemblyHostEnvironment>(_ => new HostEnv(environment, ""));
        return (ctx, updaterService);
    }

    [TestCase("Production", true)]
    [TestCase("Development", false)]
    public void Visibility_by_Environment_with_DefaultParams_Test(string hostEnv, bool expectedVisible)
    {
        // Given
        var (ctx, updaterService) = CreateContext(hostEnv);
        using var cleanUp = ctx;

        var cut = ctx.RenderComponent<PWAUpdater>();
        cut.Find(".pwa-updater").ClassList.Contains("visible").IsFalse();

        // When
        updaterService.InvokeNextVersionIsWaiting();

        // Then
        cut.Find(".pwa-updater").ClassList.Contains("visible").Is(expectedVisible);
    }

    [TestCase("Production", "", true)]
    [TestCase("Development", "", true)]
    [TestCase("Production", "Development", false)]
    [TestCase("Development", "Development", true)]
    [TestCase("EnvA", "EnvA,EnvB", true)]
    [TestCase("EnvB", "EnvA, EnvB", true)]
    [TestCase("EnvC", "EnvA,EnvB", false)]
    public void Visibility_by_Environment_and_EnvForWorkParam_Test(string hostEnv, string envForWork, bool expectedVisible)
    {
        // Given
        var (ctx, updaterService) = CreateContext(hostEnv);
        using var cleanUp = ctx;

        var cut = ctx.RenderComponent<PWAUpdater>(param => param.Add(_ => _.EnvironmentsForWork, envForWork));
        cut.Find(".pwa-updater").ClassList.Contains("visible").IsFalse();

        // When
        updaterService.InvokeNextVersionIsWaiting();

        // Then
        cut.Find(".pwa-updater").ClassList.Contains("visible").Is(expectedVisible);
    }
}