import React, { createContext, useContext } from 'react';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { FullStoreState } from '../store/terminalStore';
import { CommandRegistry } from '../services/commandRegistry';
import { Command } from '@/types';

export interface TerminalContextValue {
  store: UseBoundStore<StoreApi<FullStoreState>>;
  registry: CommandRegistry;
  registerCommand: (command: Command) => void;
}

const TerminalContext = createContext<TerminalContextValue | null>(null);

export const TerminalContextProvider = TerminalContext.Provider;

export const useTerminalContext = (): TerminalContextValue => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('This component must be used within a TerminalContextProvider');
  }
  return context;
};

// Custom hook for accessing the Zustand store's state and actions
export const useTerminalStore = <T,>(selector: (state: FullStoreState) => T): T => {
  const { store } = useTerminalContext();
  return store(selector);
};

// Custom hook for accessing the command registry
export const useCommandRegistry = (): CommandRegistry => {
  const { registry } = useTerminalContext();
  return registry;
};
