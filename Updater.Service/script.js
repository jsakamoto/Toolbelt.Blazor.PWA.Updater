"use strict";
((Toolbelt) => {
    ((Blazor) => {
        ((PWA) => {
            ((Updater) => {
                const NULL = null;
                // Parameters in the <script> tag.
                const getAttribute = (name) => document.currentScript?.getAttribute(name);
                const serviceWorkerScriptPath = getAttribute("register") || "service-worker.js";
                const noRegister = getAttribute("no-register");
                const detectBotPattern = getAttribute("detect-bot-pattern") || "google|baidu|bingbot|duckduckbot|teoma|slurp|yandex";
                // State of the PWA updater
                let initialInstallation = false;
                let waiting = NULL;
                const waitForDotNetObjReady = Promise.withResolvers();
                const notifyNextVersionIsWaitingToBlazor = async (waitingWorker) => {
                    if (waitingWorker === NULL)
                        return;
                    waiting = waitingWorker;
                    const dotNetObjRef = await waitForDotNetObjReady.promise;
                    await dotNetObjRef.invokeMethodAsync("OnNextVersionIsWaiting");
                };
                const monitor = (worker) => {
                    if (worker === NULL)
                        return;
                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed') {
                            if (!initialInstallation)
                                notifyNextVersionIsWaitingToBlazor(worker);
                        }
                        if (worker.state === 'activated') {
                            if (!initialInstallation) {
                                setTimeout(() => window.location.reload(), 10);
                            }
                            initialInstallation = false;
                        }
                    });
                };
                const handleRegistration = (registration) => {
                    initialInstallation = registration.active === NULL;
                    const waiting = registration.waiting;
                    notifyNextVersionIsWaitingToBlazor(waiting);
                    monitor(waiting);
                    registration.addEventListener('updatefound', () => monitor(registration.installing));
                };
                Updater.handleRegistration = handleRegistration;
                Updater.setToBeReady = (dotNetObj) => {
                    waitForDotNetObjReady.resolve(dotNetObj);
                };
                Updater.skipWaiting = () => waiting?.postMessage({ type: 'SKIP_WAITING' });
                if (!noRegister && !new RegExp(detectBotPattern, "i").test(navigator.userAgent)) {
                    navigator.serviceWorker?.register(serviceWorkerScriptPath).then(handleRegistration);
                }
            })(PWA.Updater ??= {});
        })(Blazor.PWA ??= {});
    })(Toolbelt.Blazor ??= {});
})(window.Toolbelt ??= {});
