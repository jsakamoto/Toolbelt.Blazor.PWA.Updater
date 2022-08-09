using BlazorPWA1;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Toolbelt.Blazor.Extensions.DependencyInjection;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
ConfigureServices(builder.Services, builder.HostEnvironment);
await builder.Build().RunAsync();

static void ConfigureServices(IServiceCollection services, IWebAssemblyHostEnvironment hostEnvironment)
{
    services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(hostEnvironment.BaseAddress) });
    services.AddPWAUpdater();
}
