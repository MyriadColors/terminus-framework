
import { create } from 'zustand';
import React from 'react';
import { HistoryItem, Command, CommandContext } from '../types';
import { CommandRegistry } from '../services/commandRegistry';
import { parseCommand } from '../services/commandParser';
import { ThemeStyle, defaultThemes } from '../styles/themes';

interface TerminalState {
  history: HistoryItem[];
  commandHistory: string[];
  welcomeMessage?: React.ReactNode;
}

interface InputState {
  inputValue: string;
  historyIndex: number;
  suggestions: string[];
  suggestionIndex: number;
}

interface ThemeState {
  themeName: string;
  themes: Record<string, ThemeStyle>;
}

interface TerminalActions {
  addHistoryItem: (command: string, output: React.ReactNode) => void;
  clearHistory: () => void;
  addCommandToHistory: (command: string) => void;
  submitCommand: (commandStr: string) => void;
  setWelcomeMessage: (message?: React.ReactNode) => void;
}

interface InputActions {
  setInputValue: (value: string) => void;
  setHistoryIndex: (index: number) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSuggestionIndex: (index: number) => void;
  resetInputState: () => void;
}

interface ThemeActions {
    setThemeName: (name: string) => ThemeStyle | undefined;
}

export type FullStoreState = TerminalState & InputState & ThemeState & TerminalActions & InputActions & ThemeActions;

export interface CreateStoreOptions {
  registry: CommandRegistry;
  initialTheme?: string;
  customThemes?: Record<string, ThemeStyle>;
  welcomeMessage?: React.ReactNode;
}

export const createTerminalStore = ({
  registry,
  initialTheme = 'default',
  customThemes = {},
  welcomeMessage,
}: CreateStoreOptions) => create<FullStoreState>((set, get) => ({
  // Terminal State
  history: [],
  commandHistory: [],
  welcomeMessage,

  // Input State
  inputValue: '',
  historyIndex: -1,
  suggestions: [],
  suggestionIndex: -1,

  // Theme State
  themeName: initialTheme,
  themes: { ...defaultThemes, ...customThemes },

  // Terminal Actions
  addHistoryItem: (command, output) => {
    // Prevent adding session_start command to the visible output lines multiple times
    if (command === 'session_start' && get().history.some(item => item.command === 'session_start')) {
        return;
    }
    set((state) => ({
      history: [...state.history, { id: state.history.length, command, output }],
    }));
  },

  clearHistory: () => {
    set({ history: [] });
  },

  addCommandToHistory: (command) => {
    if (get().commandHistory[get().commandHistory.length - 1] !== command) {
        set((state) => ({ commandHistory: [...state.commandHistory, command] }));
    }
  },

  submitCommand: (commandStr) => {
    const commandName = commandStr.trim().split(/\s+/)[0] || '';
    
    if (!commandName) {
        return;
    }

    const command = registry.get(commandName);
    const state = get();
    const theme = state.themes[state.themeName] || state.themes.default;

    if (command) {
      try {
        const availableThemes = Object.keys(get().themes);
        const context: CommandContext = { 
            clear: get().clearHistory, 
            theme: theme, 
            availableThemes,
            setTheme: get().setThemeName,
            getAllCommands: (): Command[] => registry.getAll(),
            getCommand: (name: string): Command | undefined => registry.get(name),
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
  
  setWelcomeMessage: (message) => set({ welcomeMessage: message }),

  // Input Actions
  setInputValue: (value) => set({ inputValue: value }),
  setHistoryIndex: (index) => set({ historyIndex: index }),
  setSuggestions: (suggestions) => set({ suggestions: suggestions }),
  setSuggestionIndex: (index) => set({ suggestionIndex: index }),
  resetInputState: () => set({ inputValue: '', historyIndex: -1, suggestions: [], suggestionIndex: -1 }),
  
  // Theme Actions
  setThemeName: (name: string): ThemeStyle | undefined => {
    const themes = get().themes;
    if (themes[name]) {
        set({ themeName: name });
        return themes[name];
    }
    return undefined;
  },
}));