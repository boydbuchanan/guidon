import { useSyncExternalStore } from "react";

export type Listener = () => void;
export type Store<T> = {
  getState: () => T;
  setState: (updater: (prev: T) => T) => void;
  subscribe: (listener: Listener) => () => void; // Returns an unsubscribe function
};
export const createStore = <T>(initialState: T) => {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState: (updater: (prev: T) => T) => {
      state = updater(state);
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
};

export function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState // For server-side rendering, we can use the same getState
  );
}
