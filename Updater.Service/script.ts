namespace Toolbelt.Blazor.PWA.Updater {

    // Parameters in the <script> tag.
    const serviceWorkerScriptPath = document.currentScript?.getAttribute("register") || "service-worker.js";
    const noRegister = document.currentScript?.getAttribute("no-register") !== null;

    // State of the PWA updater
    let _dotNetObjectRef: any = null;
    let iinitialInstallation = false;
    let waiting: ServiceWorker | null = null;
    let resolve = () => { };
    const waitForReady = new Promise<void>(r => { resolve = r; });

    const notifyNextVersionIsWaitingToBlazor = async (waitingWorker: ServiceWorker) => {
        waiting = waitingWorker;
        await waitForReady;
        if (_dotNetObjectRef !== null) {
            await _dotNetObjectRef.invokeMethodAsync("OnNextVersionIsWaiting");
        }
    }

    const monitor = (worker: ServiceWorker) => {
        worker.addEventListener('statechange', () => {
            if (worker.state === 'installed') {
                if (!iinitialInstallation) notifyNextVersionIsWaitingToBlazor(worker);
            }
            if (worker.state === 'activated') {
                if (!iinitialInstallation) {
                    setTimeout(() => window.location.reload(), 10);
                }
                iinitialInstallation = false;
            }
        });
    }

    export const handleRegistration = (registration: ServiceWorkerRegistration) => {
        iinitialInstallation = registration.active === null;
        const waiting = registration.waiting;
        if (waiting !== null) {
            notifyNextVersionIsWaitingToBlazor(waiting);
            monitor(waiting);
        }

        registration.addEventListener('updatefound', () => {
            registration.installing !== null && monitor(registration.installing);
        });
    }

    export const setToBeReady = (obj: any) => {
        _dotNetObjectRef = obj;
        resolve();
    }

    export const skipWaiting = () => {
        if (waiting === null) return;
        waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    if (!noRegister) {
        navigator.serviceWorker.register(serviceWorkerScriptPath).then(handleRegistration);
    }
}