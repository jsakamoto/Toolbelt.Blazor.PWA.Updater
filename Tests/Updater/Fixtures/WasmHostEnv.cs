using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

namespace Toolbelt.Blazor.PWA.Updater.Test.Fixtures;
public class WasmHostEnv : IWebAssemblyHostEnvironment
{
    public string Environment { get; }

    public string BaseAddress { get => throw new NotImplementedException(); }

    public WasmHostEnv(string environment)
    {
        this.Environment = environment;
    }
}
