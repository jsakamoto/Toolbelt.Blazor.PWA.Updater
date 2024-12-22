export type TimeoutOptions = {
    timeout: number
};
export class PromiseWithResolve {

    public resolve: () => void;

    public promise: Promise<void>;

    constructor() {
        const { promise, resolve } = Promise.withResolvers<void>();
        this.promise = promise;
        this.resolve = resolve;
    }

    public async waitForResolve(options: TimeoutOptions): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => resolve(false), options.timeout);
            this.promise.then(() => { clearTimeout(timeout); resolve(true); });
        });
    }
};
