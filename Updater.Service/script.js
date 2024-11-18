"use strict";
var Toolbelt;
((Toolbelt) => {
    ((Blazor) => {
        ((PWA) => {
            ((Updater) => {
                const NULL = null;
                // Parameters in the <script> tag.
                const getAttribute = (name) => document.currentScript?.getAttribute(name);
                const serviceWorkerScriptPath = getAttribute("register") || "service-worker.js";
                const noRegister = getAttribute("no-register") !== NULL;
                // State of the PWA updater
                let _dotNetObjectRef = NULL;
                let initialInstallation = false;
                let waiting = NULL;
                let resolve = () => { };
                const waitForReady = new Promise(r => { resolve = r; });
                const notifyNextVersionIsWaitingToBlazor = async (waitingWorker) => {
                    if (waitingWorker === NULL)
                        return;
                    waiting = waitingWorker;
                    await waitForReady;
                    await _dotNetObjectRef?.invokeMethodAsync("OnNextVersionIsWaiting");
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
                    Updater.handleRegistration = handleRegistration;
                    registration.addEventListener('updatefound', () => monitor(registration.installing));
                };
                Updater.setToBeReady = (obj) => {
                    _dotNetObjectRef = obj;
                    resolve();
                };
                Updater.skipWaiting = () => waiting?.postMessage({ type: 'SKIP_WAITING' });
                if (!noRegister) {
                    navigator.serviceWorker.register(serviceWorkerScriptPath).then(handleRegistration);
                }
            })(PWA.Updater ??= {});
        })(Blazor.PWA ??= {});
    })(Toolbelt.Blazor ??= {});
})(Toolbelt ??= {});
