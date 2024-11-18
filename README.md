# Blazor PWA Updater [![NuGet Package](https://img.shields.io/nuget/v/Toolbelt.Blazor.PWA.Updater.svg)](https://www.nuget.org/packages/Toolbelt.Blazor.PWA.Updater/)

## 📝 Summary

Provide "Update Now" UI and feature to your Blazor PWA that appears when the next version of one is available.

![](https://raw.githubusercontent.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/main/.assets/fig.001.png)

### Supported platforms

.NET 8, 9, or later. Both Blazor Server and Blazor Assembly are supported.

## 🤔 Backgrounds

Typically, a service worker of PWA is never updated even when updated contents have been deployed to a server, even if you reload the page of that PWA. After the user has navigated away from the PWA in all tabs, updates will complete. This is not specific to Blazor, but rather is a standard web platform behavior.

For more detail, please see also the following link on the Microsoft Docs site.

[_"ASP.NET Core Blazor Progressive Web App (PWA)"_ | Miceooft Docs](https://docs.microsoft.com/aspnet/core/blazor/progressive-web-app?view=aspnetcore-6.0&tabs=visual-studio#update-completion-after-user-navigation-away-from-app)

However, sometimes, a site owner or a developer may want updates completed as soon as possible. In that case, all we can do is notify the user that the new version of the service worker is ready on the browser screen and trigger the update process via the user's manual action.

This NuGet package allows us to implement that behavior like the following GIF animation on your Blazor PWA more easily.

![](https://raw.githubusercontent.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/main/.assets/movie.001.gif)

## 🚀 Quick Start

### 1. Install this NuGet package

```shell
dotnet add package Toolbelt.Blazor.PWA.Updater
```

### 2. Register a "PWA updater" service to a DI container

```csharp
// 📜 This is the "Program.cs" file of your Blazor PWA.
...
// 👇 Add this line to open the name space...
using Toolbelt.Blazor.Extensions.DependencyInjection;
...
// 👇 and add this line to register a "PWA updater" service to a DI container.
builder.Services.AddPWAUpdater();
...
await builder.Build().RunAsync();
```

### 3. Place a `<PWAUpdater>` component  somewhere in your Blazor PWA

A `<PWAUpdater>` component is a user interface element showing users the "UPDATE NOW" button and its notification bar. One of the good places to place a `<PWAUpdater>` component is somewhere shared layout components, such as "MainLayout.razor".

```razor
@* 📜 This is the "MainLayout.razor" file of your Blazor PWA *@
@inherits LayoutComponentBase

@* 👇 Add this line to place the "UPDATE NOW" button UI. *@
<PWAUpdater />
...
```

### 4. Modify the "service-worker.published.js" file

```js
// 📜 This is the "service-worker.published.js" file of your Blazor PWA.

// 👇 Add these line to accept the message from this library.
self.addEventListener('message', event => { 
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
...
```

### 5. Modify the "index.html" file

```html
<!-- 📜 This is the "index.html" file of your Blazor PWA. -->
  ...
  <script src="_framework/blazor.webassembly.js"></script>

  <!-- 👇 Remove this script, and...
  <script>navigator.serviceWorker.register('service-worker.js');</script> -->

  <!-- 👇 add this script element instead. -->
  <script src="_content/Toolbelt.Blazor.PWA.Updater.Service/script.min.js"></script>
</body>
</html>
```

That's all.

### NOTICE: Including CSS style sheet

This package assumes that the application uses Blazor's CSS isolation by default. Usually, this pre-requirement is appropriate. However, unfortunately, some Blazor projects scenario, such as those made by the "empty" project template, are not configured for CSS isolation. In this case, the CSS file of this package will never be loaded in the app, and the PWAUpdater component will not be shown correctly. To resolve this issue, you must include this package's CSS file yourself.

Specifically, you should include the bundled CSS file for the project in the fallback HTML document file, like the following code,

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <!-- 👇 Add this line. -->
    <link href="{ASSEMBLY NAME}.styles.css" rel="stylesheet" />
    ....
```

or include the CSS file for this package individually, like the following code.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <!-- 👇 Add this line. -->
    <link href="_content/Toolbelt.Blazor.PWA.Updater/Toolbelt.Blazor.PWA.Updater.bundle.scp.css"
        rel="stylesheet" />
    ...
```

See also: https://learn.microsoft.com/aspnet/core/blazor/components/css-isolation


## ⚙️ Configuration

### Parameters of the `PWAUpdater` component

Parameter           | Type   | Description
--------------------|--------|--------------
Text                | string | The text that is shown on the notification bar UI. The default value is "The new version is ready.".
ButtonCaption       | string | The text that is shown as the caption of the button to trigger updates. The default value is "UPDATE NOW".
Align               | PWAUpdater.Aligns | The value to specify the position of the notification bar, whether `Top` or `Bottom`. The default value is `Top`.
EnvironmentsForWork | string | The comma-separated string that specifies environment names that the notification UI should work. If this parameter is an empty string, notification always works regardless of the current environment name, including during development. Usually, notification UI should be a bother during development, so the default value of this parameter is "Production", which doesn't include "Development".
State (*Bindable)   | PWAUpdater.States | The value to specify or represents the visibility state of the notification bar, whether `Hidden`, `Showing`, `Shown`, or `Hiding`. The default value is `Hidden`.
StateChanged        | EventCallback<PWAUpdater.States> | The event callback that will be invoked when the `State` parameter value changes.
ChildContent        | Renderfragment | the content to be rendered as a part of the notification bar.

### How to make the notification bar of `PWAUpdater` visible forcibly

Sometimes developers might want to make the notification bar visible even though any updates of a service worker have not happened in such a case if they are working on customizing the appearance of the notification bar.

In that case, developers can do that by setting the initial value of the `State` parameter of the `PWAUpdater` component to `Showing` temporarily.

```html
<PWAUpdater State="PWAUpdater.States.Showing"/>
```

Please don't forget to remove the settings of the `State` parameter before release.

### How to add child contents of the notification bar of `PWAUpdater`

If you want to add custom content into the notification bar of `PWAUpdater` as its child content, you can do that in the usual Blazor programming way. In other words, write markup as a child node of the `<PWAUpdater>` tag.

For example, if you  markup the component like this,

```html
<PWAUpdater>
    <a href="https://blazor.net" target="_blank"
       style="color: var(--pwa-updater-bar-color); margin-left: 26px; flex: 1">
        about Blazor
    </a>
</PWAUpdater>
```

You will see the screen, like the below picture.

![](https://raw.githubusercontent.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/main/.assets/fig.003.png)

### CSS custom properties (variables) for the `PWAUpdater` component

The following CSS custom properties (variables) are defined in the `.pwa-updater[b-pwa-updater]` scope to configure the appearance of the notification UI.

Property name               | Description
----------------------------|---------------------------
--pwa-updater-font-size     | The font size of the notification UI. The default value is `13px`.
--pwa-updater-font-family   | The font family of the notification UI. The default value is `sans-serif`.
--pwa-updater-bar-height    | The height of the notification UI. The default value is `32px`.
--pwa-updater-bar-color     | The foreground color of notification UI. The default value is `white`.
--pwa-updater-bar-backcolor | The background color of notification UI. The default value is `darkorange`.
--pwa-updater-bar-z-index   | The Z-index value of the notification UI. The default value is `10`.

If you define CSS style as below in your Blazor PWA,

```css
body .pwa-updater[b-pwa-updater] {
    --pwa-updater-bar-backcolor: forestgreen;
}
```

you will get the green appearance of the notification UI like below.

![](https://raw.githubusercontent.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/main/.assets/fig.002.png)

### Customize a service worker's script file name

By default, this package will load the "service-worker.js" JavaScript file as a service worker. If the service worker's script file path on your Blazor PWA is not "service-worker.js", then you have to specify that path as the property of the script element loading the JavaScript file of the "PWA Updater" like the following example.

```html
<!-- 📜 This is the "index.html" file of your Blazor PWA. -->
  ...
  <!-- 👇 Set the "register" to specify the service worker script file. -->
  <script src="_content/Toolbelt.Blazor.PWA.Updater.Service/script.min.js"
          register="path/to/your-service-worker.js">
  </script> 
</body>
</html>
```

### Customize the process of registering a service worker

Sometimes, you may have to do something in a service worker registering process. In this case, you can add the `no-register` attribute to the script element loading the JavaScript file of the "PWA Updater" to prevent loading the service worker's script file by that automatically.

If you do that, please manually invoke the `Toolbelt.Blazor.PWA.Updater.handleRegistration()` method, that is part of the "PWA Updater" JavaScript code, at the call back of the service worker registered.

```html
<!-- 📜 This is the "index.html" file of your Blazor PWA. -->
  ...
  <!-- 👇 Set "no-register" attribute to prevent service worker registration. -->
  <script src="_content/Toolbelt.Blazor.PWA.Updater.Service/script.min.js"
          no-register>
  </script>

  <script>
    navigator.serviceWorker.register('service-worker.js').then(registration => {
      ...
      // 👇 Invoke this manually.
      Toolbelt.Blazor.PWA.Updater.handleRegistration(registration);
      ...
    });
  </script>
</body>
</html>
```

## ⛏️ Implement UI from scratch

You can implement your UI component for "PWA Updater" from scratch.

To do that, at first, reference only the `Toolbelt.Blazor.PWA.Updater.Service` NuGet package instead of the `Toolbelt.Blazor.PWA.Updater` NuGet package.

```shell
dotnet add package Toolbelt.Blazor.PWA.Updater.Service
```

Next, inject the `IPWAUpdaterService` object into your Razor component.

```razor
@* 📜 Your Razor component file (.razor) *@
@using Toolbelt.Blazor.PWA.Updater.Service
@inject IPWAUpdaterService PWAUpdaterService
...
```

Then, subscribe to the `NextVersionIsWaiting` event on your component. When the `NextVersionIsWaiting` event is fired, the Blazor PWA is ready to update to the next version. Ordinary, the component should show a notification to users when this event was fired.

```razor
@* 📜 Your Razor component file (.razor) *@
...
@code {
  protected override void OnAfterRender(bool firstRender)
  {
    if (firstRender)
    {
      this.PWAUpdaterService.NextVersionIsWaiting += PWAUpdaterService_NextVersionIsWaiting;
    }
  }
  ...
```

> **Warning**  
> I strongly recommend subscribing to that event in the `OnAfterRender` life cycle event method. If you subscribe to the event in other life cycle methods such as `OnInitialized`, you will run into an error at runtime when server-side pre-rendering if you implemented server-side pre-rendering on the Blazor PWA.

> **Warning**  
> Please remember to unsubscribe the subscription to the `NextVersionIsWaiting` event when your component will be disposing, like an example code below.

```razor
@* 📜 Your Razor component file (.razor) *@
...
@implements IDisposable
...
@code {
  ...
  void IDisposable.Dispose()
  {
    this.PWAUpdaterService.NextVersionIsWaiting -= PWAUpdaterService_NextVersionIsWaiting;
  }
  ...
```

At last, invoke the `SkipWaitingAsync` async method of the `IPWAUpdaterService` object for updating the Blazor PWA to the next version. Ordinary that method should be invoked according to the user's actions. The `SkipWaitingAsync` method will cause updating the Blazor PWA to the next version, and the Blazor PWA will be reloaded immediately.

```razor
@* 📜 Your Razor component file (.razor) *@
...
@code {
  ...
  private async Task OnClickUpdateNowAsync()
  {
    await this.PWAUpdaterService.SkipWaitingAsync();
  }
  ...
```

Additionally, please consider implementing your UI will work only on a released environment. If the "PWA Updater" UI always works, including the development phase, it must deteriorate the development speed. The UI provided by the `Toolbelt.Blazor.PWA.Updater` NuGet package is doing that by referencing the `Environment` property of the `IWebAssemblyHostEnvironment` object.

## 🎉 Release Notes

- [For Toolbelt.Blazor.PWA.Updater](https://github.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/blob/main/Updater/RELEASE-NOTES.txt).
- [For Toolbelt.Blazor.PWA.Updater.Service](https://github.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/blob/main/Updater.Service/RELEASE-NOTES.txt).

## 📢 License

[Mozilla Public License Version 2.0](https://github.com/jsakamoto/Toolbelt.Blazor.PWA.Updater/blob/main/LICENSE)