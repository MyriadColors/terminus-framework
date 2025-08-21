import React from 'react';
import { useTerminalStore } from '../contexts/TerminalContext';
import { HistoryItem, ThemeStyle } from '../types';

export interface TerminalState {
  history: HistoryItem[];
  currentTheme: ThemeStyle;
  availableThemes: string[];
}

export interface TerminalActions {
  print: (output: React.ReactNode) => void;
  run: (command: string) => void;
  clear: () => void;
  setTheme: (themeName: string) => void;
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
    setThemeName,
    addCommandToHistory,
    history,
    themes,
    themeName
  } = useTerminalStore((state) => ({
    addHistoryItem: state.addHistoryItem,
    submitCommand: state.submitCommand,
    clearHistory: state.clearHistory,
    setThemeName: state.setThemeName,
    addCommandToHistory: state.addCommandToHistory,
    history: state.history,
    themes: state.themes,
    themeName: state.themeName,
  }));

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

  const setTheme = React.useCallback((name: string) => {
    setThemeName(name);
  }, [setThemeName]);

  const state: TerminalState = React.useMemo(() => ({
    history,
    currentTheme: themes[themeName] || themes.default,
    availableThemes: Object.keys(themes),
  }), [history, themes, themeName]);
  
  return {
    print,
    run,
    clear,
    setTheme,
    state,
  };
};
