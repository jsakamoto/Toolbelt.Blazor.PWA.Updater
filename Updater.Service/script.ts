interface IDotNetObjectRef {
    invokeMethodAsync(methodName: string, ...args: any[]): Promise<any>;
}

((Toolbelt) => {
    ((Blazor) => {
        ((PWA) => {
            ((Updater) => {

                const NULL = null;
                const navi = navigator;

                // Parameters in the <script> tag.
                const getAttribute = (name: string) => document.currentScript?.getAttribute(name);
                const serviceWorkerScriptPath = getAttribute("register") || "service-worker.js";
                const noRegister = getAttribute("no-register");
                const detectBotPattern = getAttribute("detect-bot-pattern") || "google|baidu|bingbot|duckduckbot|teoma|slurp|yandex|toutiao|bytespider|applebot";

                // State of the PWA updater
                let initialInstallation = false;
                let waiting: ServiceWorker | null = NULL;
                const waitForDotNetObjReady = Promise.withResolvers<IDotNetObjectRef>();

                const notifyNextVersionIsWaitingToBlazor = async (waitingWorker: ServiceWorker | null) => {
                    if (waitingWorker === NULL) return;
                    waiting = waitingWorker;
                    const dotNetObjRef = await waitForDotNetObjReady.promise;
                    await dotNetObjRef.invokeMethodAsync("OnNextVersionIsWaiting");
                }

                const monitor = (worker: ServiceWorker | null) => {
                    if (worker === NULL) return;
                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed') {
                            if (!initialInstallation) notifyNextVersionIsWaitingToBlazor(worker);
                        }
                        if (worker.state === 'activated') {
                            if (!initialInstallation) {
                                setTimeout(() => window.location.reload(), 10);
                            }
                            initialInstallation = false;
                        }
                    });
                }

                const handleRegistration = (registration: ServiceWorkerRegistration) => {
                    initialInstallation = registration.active === NULL;
                    const waiting = registration.waiting;
                    notifyNextVersionIsWaitingToBlazor(waiting);
                    monitor(waiting);
                    registration.addEventListener('updatefound', () => monitor(registration.installing));
                }
                Updater.handleRegistration = handleRegistration;

                Updater.setToBeReady = (dotNetObj: IDotNetObjectRef) => {
                    waitForDotNetObjReady.resolve(dotNetObj);
                }

                Updater.skipWaiting = () => waiting?.postMessage({ type: 'SKIP_WAITING' });

                if (!noRegister && !new RegExp(detectBotPattern, "i").test(navi.userAgent)) {
                    navi.serviceWorker?.register(serviceWorkerScriptPath, { updateViaCache: 'none' }).then(handleRegistration);
                }

            })(PWA.Updater ??= {});
        })(Blazor.PWA ??= {});
    })(Toolbelt.Blazor ??= {})
})((window as any).Toolbelt ??= {});
