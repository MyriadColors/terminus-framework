import React from 'react';
import { useTerminalStore, useTerminalContext } from '../contexts/TerminalContext';
import { HistoryItem, ThemeStyle, Command } from '../types';

export interface TerminalState {
  history: HistoryItem[];
  currentTheme: ThemeStyle;
  availableThemes: string[];
  currentPath: string;
  isBusy: boolean;
}

export interface TerminalActions {
  print: (output: React.ReactNode) => void;
  run: (command: string) => void;
  clear: () => void;
  setTheme: (themeNameOrObject: string | ThemeStyle) => void;
  registerCommand: (command: Command) => void;
  setCurrentPath: (path: string) => void;
}

export interface UseTerminalResult extends TerminalActions {
  state: TerminalState;
}

const PROGRAMMATIC_PRINT_COMMAND = 'programmatic_print';

/**
 * Public hook for interacting with the Terminal state from anywhere
 * inside the TerminalProvider.
 */
export const useTerminal = (): UseTerminalResult => {
  const {
    addHistoryItem,
    submitCommand,
    clearHistory,
    setTheme: storeSetTheme,
    addCommandToHistory,
    history,
    themes,
    themeName,
    currentPath,
    setCurrentPath,
    isBusy,
  } = useTerminalStore((state) => ({
    addHistoryItem: state.addHistoryItem,
    submitCommand: state.submitCommand,
    clearHistory: state.clearHistory,
    setTheme: state.setTheme,
    addCommandToHistory: state.addCommandToHistory,
    history: state.history,
    themes: state.themes,
    themeName: state.themeName,
    currentPath: state.currentPath,
    setCurrentPath: state.setCurrentPath,
    isBusy: state.isBusy,
  }));

  const { registerCommand } = useTerminalContext();

  const print = React.useCallback((output: React.ReactNode) => {
    addHistoryItem(PROGRAMMATIC_PRINT_COMMAND, output);
  }, [addHistoryItem]);

  const run = React.useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (trimmedCommand) {
      addCommandToHistory(trimmedCommand);
      submitCommand(trimmedCommand);
    }
  }, [submitCommand, addCommandToHistory]);

  const clear = React.useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const setTheme = React.useCallback((nameOrObject: string | ThemeStyle) => {
    storeSetTheme(nameOrObject);
  }, [storeSetTheme]);

  const state: TerminalState = React.useMemo(() => ({
    history,
    currentTheme: themes[themeName] || themes.default,
    availableThemes: Object.keys(themes),
    currentPath,
    isBusy,
  }), [history, themes, themeName, currentPath, isBusy]);
  
  return {
    print,
    run,
    clear,
    setTheme,
    registerCommand,
    setCurrentPath,
    state,
  };
};
