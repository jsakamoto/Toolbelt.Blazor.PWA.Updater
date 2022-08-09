"use strict";
var Toolbelt;
(function (Toolbelt) {
    var Blazor;
    (function (Blazor) {
        var PWA;
        (function (PWA) {
            var Updater;
            (function (Updater) {
                // Parameters in the <script> tag.
                const serviceWorkerScriptPath = document.currentScript?.getAttribute("register") || "service-worker.js";
                const noRegister = document.currentScript?.getAttribute("no-register") !== null;
                // State of the PWA updater
                let _dotNetObjectRef = null;
                let iinitialInstallation = false;
                let waiting = null;
                let resolve = () => { };
                const waitForReady = new Promise(r => { resolve = r; });
                const notifyNextVersionIsWaitingToBlazor = async (waitingWorker) => {
                    waiting = waitingWorker;
                    await waitForReady;
                    if (_dotNetObjectRef !== null) {
                        await _dotNetObjectRef.invokeMethodAsync("OnNextVersionIsWaiting");
                    }
                };
                const monitor = (worker) => {
                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed') {
                            if (!iinitialInstallation)
                                notifyNextVersionIsWaitingToBlazor(worker);
                        }
                        if (worker.state === 'activated') {
                            if (!iinitialInstallation) {
                                setTimeout(() => window.location.reload(), 10);
                            }
                            iinitialInstallation = false;
                        }
                    });
                };
                Updater.handleRegistration = (registration) => {
                    iinitialInstallation = registration.active === null;
                    const waiting = registration.waiting;
                    if (waiting !== null) {
                        notifyNextVersionIsWaitingToBlazor(waiting);
                        monitor(waiting);
                    }
                    registration.addEventListener('updatefound', () => {
                        registration.installing !== null && monitor(registration.installing);
                    });
                };
                Updater.setToBeReady = (obj) => {
                    _dotNetObjectRef = obj;
                    resolve();
                };
                Updater.skipWaiting = () => {
                    if (waiting === null)
                        return;
                    waiting.postMessage({ type: 'SKIP_WAITING' });
                };
                if (!noRegister) {
                    navigator.serviceWorker.register(serviceWorkerScriptPath).then(Updater.handleRegistration);
                }
            })(Updater = PWA.Updater || (PWA.Updater = {}));
        })(PWA = Blazor.PWA || (Blazor.PWA = {}));
    })(Blazor = Toolbelt.Blazor || (Toolbelt.Blazor = {}));
})(Toolbelt || (Toolbelt = {}));
