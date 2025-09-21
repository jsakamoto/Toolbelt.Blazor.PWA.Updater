import { test, expect, describe } from 'vitest';
import { ServiceWorkerMock } from './fixtures/serviceWorkerMock.ts';
import { createContext } from './fixtures/context.ts';
import './fixtures/customMatcher.ts';

describe('test for PWA Updater script', () => {

    test('default 1st execution', async () => {
        // GIVEN
        const { context, window } = await createContext({
            initialState: {
                installing: "installing",
                waiting: null,
                active: null
            }
        });
        expect(context.registeredScriptPath).toBe("service-worker.js");

        // verify the registration state
        expect(context.registration.installing).toBeState("installing");
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeNull();

        // WHEN.1: Emulate initial installation of the service worker
        await context.registration.dispatchEvent('updatefound');

        context.registration.moveStage({ from: "installing", to: "waiting" });
        await context.registration.waiting?.dispatchStateChange('installed');

        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');
        await context.registration.active?.dispatchStateChange('activated');

        // THEN.1: There is no notification to Blazor because it is the first installation.
        expect(context.dotNetObj.invokeHistories).toEqual([]);

        // -- STEP 2 --

        // WHEN.2: Emulate the next installation of the service worker
        context.registration.installing = new ServiceWorkerMock("installing");
        await context.registration.dispatchEvent('updatefound');

        context.registration.moveStage({ from: "installing", to: "waiting" });
        await context.registration.waiting?.dispatchStateChange('installed');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeState("installed");
        expect(context.registration.active).toBeState("activated");

        // THEN.2: The notification to Blazor is sent because the next installation is done.
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);

        // -- STEP 3 --

        // WHEN.3: Skip waiting
        window.Toolbelt.Blazor.PWA.Updater.skipWaiting();
        const skipMessagePosted = await context.registration.waiting?.waitForSkipWaitingMessage({ timeout: 1000 });
        expect(skipMessagePosted).toBe(true);

        // activating...
        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');

        // activated.
        await context.registration.active?.dispatchStateChange('activated');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeState("activated");

        // THEN.3: The page is reloaded because the service worker is activated.
        const pageReloaded = await context.waitForPageReload({ timeout: 1000 });
        expect(pageReloaded).toBe(true);
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);
    })

    test('custom service worker path', async () => {
        const { context } = await createContext({
            serviceWorkerScriptPath: "custom-service-worker.js",
            initialState: {
                installing: "installing",
                waiting: null,
                active: null
            }
        });
        expect(context.registeredScriptPath).toBe("custom-service-worker.js");
    })

    test('default 1st execution with manual registration', async () => {
        // GIVEN
        const { context, window, navigator, Toolbelt } = await createContext({
            noRegister: true,
            initialState: {
                installing: "installing",
                waiting: null,
                active: null
            }
        });
        expect(context.registeredScriptPath).toBeNull();
        expect(context.dotNetObj.invokeHistories).toEqual([]);

        // WHEN.0: Manual registration
        const registration = await navigator.serviceWorker.register("manual-service-worker.js");
        Toolbelt.Blazor.PWA.Updater.handleRegistration(registration);

        // THEN.0: The service worker is registered.
        expect(context.registeredScriptPath).toBe("manual-service-worker.js");

        // verify the registration state
        expect(context.registration.installing).toBeState("installing");
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeNull();

        // WHEN.1: Emulate initial installation of the service worker
        await context.registration.dispatchEvent('updatefound');

        context.registration.moveStage({ from: "installing", to: "waiting" });
        await context.registration.waiting?.dispatchStateChange('installed');

        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');

        await context.registration.active?.dispatchStateChange('activated');

        // THEN.1: There is no notification to Blazor because it is the first installation.
        expect(context.dotNetObj.invokeHistories).toEqual([]);

        // -- STEP 2 --

        // WHEN.2: Emulate the next installation of the service worker
        context.registration.installing = new ServiceWorkerMock("installing");
        await context.registration.dispatchEvent('updatefound');

        context.registration.moveStage({ from: "installing", to: "waiting" });
        await context.registration.waiting?.dispatchStateChange('installed');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeState("installed");
        expect(context.registration.active).toBeState("activated");

        // THEN.2: The notification to Blazor is sent because the next installation is done.
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);

        // -- STEP 3 --

        // WHEN.3: Skip waiting
        window.Toolbelt.Blazor.PWA.Updater.skipWaiting();
        const skipMessagePosted = await context.registration.waiting?.waitForSkipWaitingMessage({ timeout: 1000 });
        expect(skipMessagePosted).toBe(true);

        // activating...
        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');

        // activated.
        await context.registration.active?.dispatchStateChange('activated');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeState("activated");

        // THEN.3: The page is reloaded because the service worker is activated.
        const pageReloaded = await context.waitForPageReload({ timeout: 1000 });
        expect(pageReloaded).toBe(true);
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);
    })

    test('reload the page after the service worker is activated', async () => {
        // GIVEN
        const { context, window } = await createContext({
            initialState: {
                installing: null,
                waiting: null,
                active: "activated"
            }
        });
        expect(context.registeredScriptPath).toBe("service-worker.js");

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeState("activated");

        // WHEN.1: Wait for a while
        await new Promise(resolve => setTimeout(resolve, 500));

        // THEN.1: Nothing happens because the service worker is already activated.
        expect(context.dotNetObj.invokeHistories).toEqual([]);

        // -- STEP 2 --

        // WHEN.2: Emulate the next installation of the service worker
        context.registration.installing = new ServiceWorkerMock("installing");
        await context.registration.dispatchEvent('updatefound');

        context.registration.moveStage({ from: "installing", to: "waiting" });
        await context.registration.waiting?.dispatchStateChange('installed');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeState("installed");
        expect(context.registration.active).toBeState("activated");

        // THEN.2: The notification to Blazor is sent because the next installation is done.
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);

        // -- STEP 3 --

        // WHEN.3: Skip waiting
        window.Toolbelt.Blazor.PWA.Updater.skipWaiting();
        const skipMessagePosted = await context.registration.waiting?.waitForSkipWaitingMessage({ timeout: 1000 });
        expect(skipMessagePosted).toBe(true);

        // activating...
        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');

        // activated.
        await context.registration.active?.dispatchStateChange('activated');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeState("activated");

        // THEN.3: The page is reloaded because the service worker is activated.
        const pageReloaded = await context.waitForPageReload({ timeout: 1000 });
        expect(pageReloaded).toBe(true);
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);
    })

    test('reload the page when the next service worker is waiting for activated', async () => {
        // GIVEN
        const { context, window } = await createContext({
            initialState: {
                installing: null,
                waiting: "installed",
                active: "activated"
            }
        });

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeState("installed");
        expect(context.registration.active).toBeState("activated");

        // WHEN.1: Wait for a while
        await new Promise(resolve => setTimeout(resolve, 500));

        // THEN.1: The new service worker is detected and the notification to Blazor is sent.
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);

        // -- STEP 2 --

        // WHEN.2: Skip waiting
        window.Toolbelt.Blazor.PWA.Updater.skipWaiting();
        if (context.registration.waiting == null) throw new Error("waiting is null");
        const skipMessagePosted = await context.registration.waiting.waitForSkipWaitingMessage({ timeout: 1000 });
        expect(skipMessagePosted).toBe(true);

        // activating...
        context.registration.moveStage({ from: "waiting", to: "active" });
        await context.registration.active?.dispatchStateChange('activating');

        // activated.
        await context.registration.active?.dispatchStateChange('activated');

        // verify the registration state
        expect(context.registration.installing).toBeNull();
        expect(context.registration.waiting).toBeNull();
        expect(context.registration.active).toBeState("activated");

        // THEN.2: The page is reloaded because the service worker is activated.
        const pageReloaded = await context.waitForPageReload({ timeout: 1000 });
        expect(pageReloaded).toBe(true);
        expect(context.dotNetObj.invokeHistories).toEqual(["OnNextVersionIsWaiting"]);
    })
});
