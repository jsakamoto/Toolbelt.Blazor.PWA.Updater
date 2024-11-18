using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Toolbelt.Blazor.PWA.Updater.Service;

internal class PWAUpdaterService : IPWAUpdaterService, IDisposable
{
    private readonly IServiceProvider _ServiceProvider;

    private readonly IJSRuntime _JSRuntime;

    private readonly ILogger<PWAUpdaterService> _Logger;

    private bool _Initialized = false;

    private DotNetObjectReference<PWAUpdaterService> _This;

    private EventHandler? _NextVersionIsWaiting;

    private static readonly string _NS = "Toolbelt.Blazor.PWA.Updater";

    public string? _HostEnvironment = null;

    public string HostEnvironment
    {
        get
        {
            if (this._HostEnvironment == null)
            {
                this._HostEnvironment = GetHostEnvironmentName(this._ServiceProvider) ?? "Production";
            }
            return this._HostEnvironment;
        }
    }

    public event EventHandler? NextVersionIsWaiting
    {
        add
        {
            this._NextVersionIsWaiting += value;
            if (!this._Initialized)
            {
                this._Initialized = true;
                var t = this._JSRuntime.InvokeVoidAsync(_NS + ".setToBeReady", this._This);
                t.GetAwaiter().OnCompleted(() =>
                {
                    try { t.GetAwaiter().GetResult(); }
                    catch (Exception e) { this._Logger.LogError(e, e.Message); }
                });
            }
        }
        remove
        {
            this._NextVersionIsWaiting -= value;
        }
    }

    [DynamicDependency(nameof(OnNextVersionIsWaiting))]
    public PWAUpdaterService(IServiceProvider serviceProvider, IJSRuntime jSRuntime, ILogger<PWAUpdaterService> logger)
    {
        this._ServiceProvider = serviceProvider;
        this._JSRuntime = jSRuntime;
        this._Logger = logger;
        this._This = DotNetObjectReference.Create(this);
    }

    private static string? GetHostEnvironmentName(IServiceProvider serviceProvider)
    {
        var (serviceObject, propertyInfo) = EnumHostEnvironmentService()
            .Select(((Type serviceType, PropertyInfo? propInfo) a) => (serviceProvider.GetService(a.serviceType), a.propInfo))
            .Where(((object? service, PropertyInfo? propInfo) a) => a.service != null && a.propInfo != null)
            .FirstOrDefault();
        if (serviceObject != null && propertyInfo != null)
        {
            return propertyInfo.GetValue(serviceObject) as string;
        }
        return null;
    }

    public static IEnumerable<(Type, PropertyInfo?)> EnumHostEnvironmentService()
    {
#pragma warning disable IL2026, IL2075
        foreach (var type in AppDomain.CurrentDomain.GetAssemblies().SelectMany(asm => { try { return asm.GetExportedTypes(); } catch { return Enumerable.Empty<Type>(); } }))
        {
            if (type.FullName == "Microsoft.AspNetCore.Components.WebAssembly.Hosting.IWebAssemblyHostEnvironment")
            {
                yield return (type, type.GetProperty("Environment"));
            }
            else if (type.FullName == "Microsoft.Extensions.Hosting.IHostEnvironment")
            {
                yield return (type, type.GetProperty("EnvironmentName"));
            }
        }
#pragma warning restore IL2026, IL2075
    }

    public async ValueTask SkipWaitingAsync()
    {
        await this._JSRuntime.InvokeVoidAsync(_NS + ".skipWaiting");
    }

    [JSInvokable, EditorBrowsable(EditorBrowsableState.Never)]
    public void OnNextVersionIsWaiting()
    {
        this._NextVersionIsWaiting?.Invoke(this, EventArgs.Empty);
    }

    public void Dispose()
    {
        this._This.Dispose();
    }
}
