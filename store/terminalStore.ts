
import { create } from 'zustand';
import React from 'react';
import { HistoryItem } from '../types';
import { commandRegistry } from '../services/commandRegistry';
import { parseCommand } from '../services/commandParser';
import { useTheme as useThemeHook, ThemeStyle } from '../contexts/ThemeContext';

const WelcomeMessage: React.FC = () => {
    const { theme } = useThemeHook();
    return React.createElement('div', null,
        React.createElement('p', { className: theme.textPrimary }, 'Welcome to Terminus!'),
        React.createElement('p', null, 'This is a React-based framework for building interactive TUIs.'),
        React.createElement('p', null, 
            'Type ',
            React.createElement('span', { className: theme.textSecondary }, "'help'"),
            ' to see a list of available commands.'
        )
    );
};

interface TerminalState {
  history: HistoryItem[];
  commandHistory: string[];
}

interface TerminalActions {
  addHistoryItem: (command: string, output: React.ReactNode) => void;
  clearHistory: () => void;
  addCommandToHistory: (command: string) => void;
  submitCommand: (
    commandStr: string,
    themeContext: {
      theme: ThemeStyle;
      setThemeName: (name: string) => void;
      themes: Record<string, ThemeStyle>;
    }
  ) => void;
  initialize: () => void;
}

export const useTerminalStore = create<TerminalState & TerminalActions>((set, get) => ({
  history: [],
  commandHistory: [],

  initialize: () => {
    if (get().history.length === 0) {
        get().addHistoryItem('session_start', React.createElement(WelcomeMessage));
    }
  },

  addHistoryItem: (command, output) => {
    set((state) => ({
      history: [...state.history, { id: state.history.length, command, output }],
    }));
  },

  clearHistory: () => {
    set({ history: [] });
  },

  addCommandToHistory: (command) => {
    if (get().commandHistory.at(-1) !== command) {
        set((state) => ({ commandHistory: [...state.commandHistory, command] }));
    }
  },

  submitCommand: (commandStr, themeContext) => {
    const { theme, setThemeName, themes } = themeContext;
    const commandName = commandStr.trim().split(/\s+/)[0] || '';
    
    if (!commandName) {
        return;
    }

    const command = commandRegistry.get(commandName);

    if (command) {
      try {
        const availableThemes = Object.keys(themes);
        const context = { 
            clearHistory: get().clearHistory, 
            theme, 
            availableThemes,
            setTheme: (name: string): boolean => {
                if (availableThemes.includes(name)) {
                    setThemeName(name);
                    return true;
                }
                return false;
            }
        };

        const args = parseCommand(commandStr, command.args);
        const output = command.handler(args, context);
        
        if (output !== undefined && output !== null) {
            get().addHistoryItem(commandStr, output);
        }
      } catch (error) {
        get().addHistoryItem(commandStr, React.createElement('p', { className: theme.textError }, `Error executing command: ${(error as Error).message}`));
      }
    } else {
      get().addHistoryItem(commandStr, React.createElement('p', { className: theme.textError }, `Command not found: '${commandName}'. Type 'help' for a list of commands.`));
    }
  },
}));
