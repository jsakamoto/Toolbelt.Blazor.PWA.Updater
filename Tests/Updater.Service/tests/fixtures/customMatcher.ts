import { expect } from "vitest";
import { ServiceWorkerMock } from "./serviceWorkerMock.ts";

expect.extend({
    toBeState(received: ServiceWorkerMock | null, state: ServiceWorkerState) {
        if (received == null) {
            return {
                message: () => `The service worker is null.`,
                pass: false,
            };
        }

        if (received.state === state) {
            return {
                message: () => `expected the service worker state to be ${state}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected the service worker state is ${received.state}, not ${state}`,
                pass: false,
            };
        }
    }
});

declare module 'vitest' {
    interface Assertion<T = any> {
        /**
         * Assert that the "state" property of the service worker should be the specified state.
         * @param state
         */
        toBeState(state: ServiceWorkerState): void;
    }
}
