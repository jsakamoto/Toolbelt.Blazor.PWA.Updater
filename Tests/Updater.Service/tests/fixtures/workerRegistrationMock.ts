import { ServiceWorkerMock } from "./serviceWorkerMock.ts";

export type KeyOfStage = keyof Pick<WorkerRegistrationMock, "installing" | "waiting" | "active">;

export class WorkerRegistrationMock {
    public installing: ServiceWorkerMock | null = null;
    public waiting: ServiceWorkerMock | null = null;
    public active: ServiceWorkerMock | null = null;
    private eventListeners: { [key: string]: (() => void)[] } = {};
    public addEventListener(event: string, callback: () => void) {
        (this.eventListeners[event] ??= []).push(callback);
    }
    public async dispatchEvent(event: string) {
        this.eventListeners[event]?.forEach(callback => callback());
    }
    public moveStage(arg: { from: KeyOfStage, to: KeyOfStage }): ServiceWorkerMock {
        this[arg.to] = this[arg.from];
        this[arg.from] = null;
        const to = this[arg.to];
        if (to === null) throw new Error(`Cannot move from ${arg.from} to ${arg.to}`);
        return to;
    }
};
