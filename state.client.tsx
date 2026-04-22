"use client"
import React, { useContext, createContext, useCallback, useMemo } from 'react';
import { createStore, useStore } from './store';

export type MinMax = { min?: number, max?: number, replace?: boolean }
type IsTrueMap = Record<string, boolean>;
export type IdState = {
  isTrue: IsTrueMap
};
const defaultState: IdState = {
  isTrue: {}
};

export type IdActions = {
  setValue: (id: string, value: boolean) => void;
};
export type StateProviderProps = { 
  children: React.ReactNode, 
  initialState?: IsTrueMap
}

export const idStore = createStore(defaultState);

const StateContext = createContext<IdState | null>(null);
const ActionContext = createContext<IdActions | null>(null);

export type UpdateStrategy = (prev: IsTrueMap, id: string, value?: boolean) => IsTrueMap;
export function useRootIdState() {
  const state = useStore(idStore);
  return {
    isTrue: state.isTrue,
    setValue: useCallback((id: string, value?: boolean) => {
      idStore.setState(prev => ({ 
        ...prev, 
        isTrue: defaultStrategy(prev.isTrue, id, value) 
      }));
    }, [])
  };
}
export function useLocalIdState() {
  const localState = useContext(StateContext);
  const globalState = useStore(idStore);
  const actions = useContext(ActionContext);

  const globalSetValue = useCallback((id: string, value?: boolean) => {
    idStore.setState(prev => ({
      ...prev,
      isTrue: defaultStrategy(prev.isTrue, id, value)
    }));
  }, []);

  return {
    isTrue: (localState ?? globalState).isTrue,
    setValue: actions?.setValue ?? globalSetValue,
  };
}
function StateProvider({ children, updateLogic, initialState = {} } 
  : StateProviderProps & { updateLogic: UpdateStrategy }) {
  
  const store = useMemo(() => createStore<IdState>({ isTrue: initialState }), []);
  
  // 1. Subscribe to the store to force this component to re-render
  const state = useStore(store);

  // 2. Actions are now stable. They never change, even when state changes.
  const actions = useMemo(() => ({
    setValue: (id: string, value?: boolean) => {
      store.setState((prev) => ({
        ...prev,
        isTrue: updateLogic(prev.isTrue, id, value)
      }));
    }
  }), [updateLogic]);

  return (
    <ActionContext.Provider value={actions}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </ActionContext.Provider>
  );
}
/**
 * Allows for multiple items to be true at once with no restrictions.
 */
export function LocalProvider({ ...props } : StateProviderProps) {
  return (
    <StateProvider {...props} 
      updateLogic={defaultStrategy}
    />
  );
}

/**
 * Toggles the value of the given ID, allowing for multiple items to be true at once with no restrictions.
 * @param {React.Context<IdContextValue | null>} Context - The context to use for this provider (default: LocalContext)
 * @param {Record<string, boolean>} initialState - An object mapping IDs to their initial boolean state
 */
export function ToggleProvider({ ...props } : StateProviderProps) {
  return (
    <StateProvider {...props} 
      updateLogic={toggleStrategy}
    />
  );
}
/**
 * Allows for only 1 item to be true at a time.
 * Functionally equivalent to <SelectionProvider min=1 max=1 replace=true />
 * @param {React.Context<IdContextValue | null>} Context - The context to use for this provider (default: LocalContext)
 * @param {Record<string, boolean>} initialState - An object mapping IDs to their initial boolean state
 */
export function RadioProvider({ ...props } : StateProviderProps) {
  return (
    <StateProvider {...props} 
      updateLogic={radioStrategy}
    />
  );
}
/**
 * Allows for multiple items to be true at once, but enforces min/max limits. 
 * If max is reached, new trues will be ignored until some are turned off. 
 * If replace is true, then when max is reached, the oldest true item will be turned off to allow the new one.
 * @param {React.Context<IdContextValue | null>} Context - The context to use for this provider (default: LocalContext)
 * @param {Record<string, boolean>} initialState - An object mapping IDs to their initial boolean state
 * @param {number} min - Minimum number of items that can be true at once (optional)
 * @param {number} max - Maximum number of items that can be true at once (optional)
 * @param {boolean} replace - If true, when max is reached, the oldest true item will be turned off to allow the new one (optional)
 */
export function SelectionProvider({ min, max, replace, ...props } : StateProviderProps & MinMax) {
  return (
    <StateProvider {...props} 
      updateLogic={createSelectionStrategy({ min, max, replace })}
    />
  );
}
/**
 * Toggles the boolean state of the given ID.
 */
export const defaultStrategy: UpdateStrategy = (prev, id, value) => { 
  return {
    ...prev,
    [id]: value ?? false,
  };
}
export const toggleStrategy: UpdateStrategy = (prev, id) => { 
  return {
    ...prev,
    [id]: !prev[id],
  };
}
/**
 * Sets the given ID to true and all other IDs to false, ensuring only one ID can be true at a time.
 */
export const radioStrategy: UpdateStrategy = (prev, id) => { 
  const resetState = Object.keys(prev).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as IsTrueMap);

  return {
    ...resetState,
    [id]: true,
  };
};
/**
 * Creates a selection strategy that allows for multiple IDs to be true at once, but enforces minimum and maximum limits.
 * If the maximum number of true IDs is reached, new trues will be ignored until some are turned off. 
 * If the 'replace' option is enabled, then when the maximum is reached, the oldest true ID will be turned off to allow the new one to be set to true.
 */
export const createSelectionStrategy = ({ min, max, replace }: MinMax) => {
  // This lives inside the closure of the strategy, not in the state object.
  // It persists as long as the strategy exists.
  let selectionQueue: string[] = [];
  let initialized = false;

  return (prev: IsTrueMap, id: string): IsTrueMap => {
    if (!initialized) {
      selectionQueue = Object.keys(prev).filter(k => prev[k]);
      initialized = true;
    }
    // Sync queue with reality (handle cases where items are removed externally)
    selectionQueue = selectionQueue.filter(key => prev[key] === true);
    
    const isCurrentlySelected = !!prev[id];
    const currentTrueCount = Object.keys(prev).filter(k => prev[k]).length;

    // 1. Handle Unchecking
    if (isCurrentlySelected) {
      if (min !== undefined && currentTrueCount <= min) return prev;
      selectionQueue = selectionQueue.filter(key => key !== id);
      return { ...prev, [id]: false };
    }

    // 2. Handle Checking
    // Replace logic: If we are at capacity, remove the oldest from the queue
    if (max && currentTrueCount >= max) {
      if (!replace) return prev;
      
      const oldestId = selectionQueue.shift(); // Remove oldest
      if (oldestId) {
        prev = { ...prev, [oldestId]: false };
      }
    }

    // Add new selection
    selectionQueue.push(id);
    return { ...prev, [id]: true };
  };
};
