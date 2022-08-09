namespace Toolbelt.Blazor.PWA.Updater.Service;

public interface IPWAUpdaterService
{
    event EventHandler? NextVersionIsWaiting;

    ValueTask SkipWaitingAsync();
}
