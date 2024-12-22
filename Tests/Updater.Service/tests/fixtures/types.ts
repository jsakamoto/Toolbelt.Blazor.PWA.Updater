export interface IDotNetObjectRef {
    invokeMethodAsync(methodName: string, ...args: any[]): Promise<any>;
}

export type Toolbelt = {
    Blazor: {
        PWA: {
            Updater: {
                handleRegistration: (registration: ServiceWorkerRegistration) => void;
                setToBeReady: (obj: IDotNetObjectRef) => void;
                skipWaiting: () => void;
            }
        }
    }
};
