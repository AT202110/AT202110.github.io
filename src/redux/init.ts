import { AppId, LocalStorageKey } from '../util/constants';
import { setActiveTab, setOpenedTabs } from './app/app-slice';
import { RootStore, startRootListening } from './index';
import { nanoid } from 'nanoid';

export const initOpenedTabs = (store: RootStore) => {
    try {
        // opened tabs
        const openedTabsString = window.localStorage.getItem(LocalStorageKey.OPENED_TABS);
        const openedAppsString = window.localStorage.getItem('rmg-home__openedApps');

        if (openedTabsString) {
            const openedTabs = JSON.parse(openedTabsString);
            if (Array.isArray(openedTabs)) {
                store.dispatch(setOpenedTabs(openedTabs));
            } else {
                console.warn('initOpenedTabs():: Cannot parse invalid opened tabs state from local storage');
            }
        } else if (openedAppsString) {
            const openedApps = JSON.parse(openedAppsString);
            if (Array.isArray(openedApps) && typeof openedApps[0] === 'string') {
                const nextOpenedApps = (openedApps as AppId[]).map(app => ({ id: nanoid(), app }));
                store.dispatch(setOpenedTabs(nextOpenedApps));
            } else {
                console.warn('initOpenedTabs():: cannot parse invalid opened apps state from local storage');
            }
        }
    } catch (e) {
        console.warn('initOpenedTabs():: cannot parse opened apps state from local storage', e);
    }
};

export const initActiveTab = (store: RootStore) => {
    const activeTab = window.localStorage.getItem(LocalStorageKey.ACTIVE_TAB);
    const openedTabs = store.getState().app.openedTabs;
    if (activeTab && openedTabs.some(({ id }) => id === activeTab)) {
        store.dispatch(setActiveTab(activeTab));
    } else {
        store.dispatch(setActiveTab(openedTabs[0]?.id));
    }
};

export default function initStore(store: RootStore) {
    initOpenedTabs(store);
    initActiveTab(store);

    startRootListening({
        predicate: (action, currentState, previousState) => {
            return JSON.stringify(currentState.app.openedTabs) !== JSON.stringify(previousState.app.openedTabs);
        },
        effect: (action, listenerApi) => {
            window.localStorage.setItem(
                LocalStorageKey.OPENED_TABS,
                JSON.stringify(listenerApi.getState().app.openedTabs)
            );
        },
    });

    startRootListening({
        predicate: (action, currentState, previousState) => {
            return currentState.app.activeTab !== previousState.app.activeTab;
        },
        effect: (action, listenerApi) => {
            const activeApp = listenerApi.getState().app.activeTab;
            activeApp !== undefined && window.localStorage.setItem(LocalStorageKey.ACTIVE_TAB, activeApp);
        },
    });
}
