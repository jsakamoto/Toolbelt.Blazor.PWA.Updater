import { PromiseWithResolve, TimeoutOptions } from "./promiseWithResolve.ts";

//export type ServiceWorkerState = "installing" | "installed" | "activating" | "activated";

export class ServiceWorkerMock {
    private eventListeners: { [key: string]: (() => void)[] } = {};

    private messageAwaiter: PromiseWithResolve;

    constructor(public state: ServiceWorkerState) {
        this.messageAwaiter = new PromiseWithResolve();
    }

    public addEventListener(event: string, callback: () => void) {
        (this.eventListeners[event] ??= []).push(callback);
    }

    public async dispatchEvent(event: string) {
        this.eventListeners[event]?.forEach(callback => callback());
    }

    public async dispatchStateChange(state: ServiceWorkerState) {
        this.state = state;
        await this.dispatchEvent('statechange');
    }

    public async waitForSkipWaitingMessage(option: TimeoutOptions): Promise<boolean> {
        return await this.messageAwaiter.waitForResolve(option);
    }

    public async postMessage(message: any) {
        if (message.type === 'SKIP_WAITING') this.messageAwaiter.resolve();
    }
};
