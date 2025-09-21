import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TimeoutOptions, PromiseWithResolve } from "./promiseWithResolve.ts";
import { ServiceWorkerMock } from "./serviceWorkerMock.ts";
import { IDotNetObjectRef, Toolbelt } from "./types.ts";
import { WorkerRegistrationMock } from "./workerRegistrationMock.ts";

declare global {
    interface Window { Toolbelt: Toolbelt; }
}

export type ContextOptions = {
    serviceWorkerScriptPath?: string,
    noRegister?: boolean,
    initialState?: {
        installing?: ServiceWorkerState | null,
        waiting?: ServiceWorkerState | null,
        active?: ServiceWorkerState | null
    }
};

export type InvokeHistory = {
    invokeHistories: string[]
};

export type Context = {
    dotNetObj: IDotNetObjectRef & InvokeHistory,
    registration: WorkerRegistrationMock,
    registeredScriptPath: string | null,
    waitForPageReload: (options: TimeoutOptions) => Promise<boolean>
}

export const createContext = async (options?: ContextOptions): Promise<{ context: Context, window: Window, navigator: typeof window.navigator, Toolbelt: Toolbelt }> => {

    const dotNetObj: IDotNetObjectRef & InvokeHistory = {
        invokeHistories: [],
        invokeMethodAsync: (methodName: string, ...args: any[]): Promise<any> => {
            dotNetObj.invokeHistories.push(methodName);
            return Promise.resolve();
        }
    };

    const registration = new WorkerRegistrationMock();

    const pageReloadAwaiter = new PromiseWithResolve();

    const context: Context = {
        dotNetObj,
        registeredScriptPath: null,
        registration,
        waitForPageReload: (options) => pageReloadAwaiter.waitForResolve(options)
    };

    const document: any = {
        currentScript: {
            getAttribute: (name: string) => {
                if (name === "no-register") return options?.noRegister;
                else if (name === "register") return options?.serviceWorkerScriptPath;
                else return undefined;
            }
        }
    };

    const navigator: any = {
        serviceWorker: {
            register: (scriptPath: string) => {
                context.registeredScriptPath = scriptPath;

                const { installing, waiting, active } = (options?.initialState ?? {});
                registration.installing = installing ? new ServiceWorkerMock(installing) : null;
                registration.waiting = waiting ? new ServiceWorkerMock(waiting) : null;
                registration.active = active ? new ServiceWorkerMock(active) : null;

                return Promise.resolve(registration);
            }
        }
    };

    const window: any = {
        document,
        navigator,
        location: { reload: () => { pageReloadAwaiter.resolve() } },
    };

    const scriptPath = resolve(__dirname, '../../../../Updater.Service/wwwroot/script.min.js');
    const scriptContent = readFileSync(scriptPath, 'utf-8');
    eval(scriptContent);

    await new Promise(resolve => setTimeout(resolve, 100));
    window.Toolbelt.Blazor.PWA.Updater.setToBeReady(context.dotNetObj);

    return { context, window, navigator, Toolbelt: window.Toolbelt };
};
