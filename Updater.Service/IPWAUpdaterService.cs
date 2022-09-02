namespace Toolbelt.Blazor.PWA.Updater.Service;

public interface IPWAUpdaterService
{
    string HostEnvironment { get; }

    event EventHandler? NextVersionIsWaiting;

    ValueTask SkipWaitingAsync();
}
