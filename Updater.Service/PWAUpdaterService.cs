using System.ComponentModel;
using Microsoft.Extensions.Logging;
using Microsoft.JSInterop;

namespace Toolbelt.Blazor.PWA.Updater.Service;

internal class PWAUpdaterService : IPWAUpdaterService, IDisposable
{
    private readonly IJSRuntime _JSRuntime;

    private readonly ILogger<PWAUpdaterService> _Logger;

    private bool _Initialized = false;

    private DotNetObjectReference<PWAUpdaterService> _This;

    private EventHandler? _NextVersionIsWaiting;

    private static readonly string _NS = "Toolbelt.Blazor.PWA.Updater";

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

    public PWAUpdaterService(IJSRuntime jSRuntime, ILogger<PWAUpdaterService> logger)
    {
        this._JSRuntime = jSRuntime;
        this._Logger = logger;
        this._This = DotNetObjectReference.Create(this);
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
