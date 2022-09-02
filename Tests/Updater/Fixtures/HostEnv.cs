using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace Toolbelt.Blazor.PWA.Updater.Test.Fixtures;

public class HostEnv : IHostEnvironment
{
    public string EnvironmentName { get; set; }

    public string ApplicationName { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public string ContentRootPath { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public IFileProvider ContentRootFileProvider { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public HostEnv(string environment)
    {
        this.EnvironmentName = environment;
    }
}
