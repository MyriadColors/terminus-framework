
import { create } from 'zustand';
import React from 'react';
import { HistoryItem, Command, CommandContext, CommandResult, isCommandResult, isOutputObject, Output } from '../types';
import { OutputType } from '../types/outputTypes';
import { 
  printLine, 
  printMultiLine,
  printSuccess, 
  printError, 
  printWarning, 
  printCode, 
  printList, 
  printTable, 
  printJson, 
  printMarkdown, 
  printCustom 
} from '../utils/outputHelpers';
import { CommandRegistry } from '../services/commandRegistry';
import { parseCommand } from '../services/commandParser';
import { ThemeStyle, defaultThemes } from '../styles/themes';

interface TerminalState {
  history: HistoryItem[];
  commandHistory: string[];
  welcomeMessage?: React.ReactNode;
  currentPath: string;
  isBusy: boolean;
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
  addHistoryItem: (command: string, output: Output | React.ReactNode, type?: 'standard' | 'error') => void;
  clearHistory: () => void;
  addCommandToHistory: (command: string) => void;
  submitCommand: (commandStr: string) => void;
  setWelcomeMessage: (message?: React.ReactNode) => void;
  registerCommand: (command: Command) => void;
  setCurrentPath: (path: string) => void;
}

interface InputActions {
  setInputValue: (value: string) => void;
  setHistoryIndex: (index: number) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSuggestionIndex: (index: number) => void;
  resetInputState: () => void;
}

interface ThemeActions {
    setTheme: (themeNameOrObject: string | ThemeStyle) => ThemeStyle | undefined;
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
  currentPath: '~',
  isBusy: false,

  // Input State
  inputValue: '',
  historyIndex: -1,
  suggestions: [],
  suggestionIndex: -1,

  // Theme State
  themeName: initialTheme,
  themes: { ...defaultThemes, ...customThemes },

  // Terminal Actions
  addHistoryItem: (command, output, type = 'standard') => {
    // Prevent adding session_start command to the visible output lines multiple times
    if (command === 'session_start' && get().history.some(item => item.command === 'session_start')) {
        return;
    }
    
    // Convert legacy ReactNode output to Output object for consistency
    let normalizedOutput: Output | React.ReactNode = output;
    if (!isOutputObject(output) && React.isValidElement(output)) {
      normalizedOutput = {
        type: OutputType.CUSTOM,
        content: { content: output }
      } as Output;
    }
    
    set((state) => ({
      history: [...state.history, { id: state.history.length, command, output: normalizedOutput, type }],
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

  submitCommand: async (commandStr) => {
    const commandName = commandStr.trim().split(/\s+/)[0] || '';
    
    if (!commandName) {
        return;
    }

    const command = registry.get(commandName);
    const state = get();
    const theme = state.themes[state.themeName] || state.themes.default;

    set({ isBusy: true });
    try {
      if (command) {
        const availableThemes = Object.keys(get().themes);
        const context: CommandContext = { 
            clear: get().clearHistory, 
            theme: theme, 
            availableThemes,
            setTheme: get().setTheme,
            getAllCommands: (): Command[] => registry.getAll(),
            getCommand: (name: string): Command | undefined => registry.get(name),
            setCurrentPath: get().setCurrentPath,
            printLine,
            printMultiLine,
            printSuccess,
            printError,
            printWarning,
            printCode,
            printList,
            printTable,
            printJson,
            printMarkdown,
            printCustom
        };

        const args = parseCommand(commandStr, command.args);
        const result = await Promise.resolve(command.handler(args, context));
        
        if (isCommandResult(result)) {
            if (result.success) {
                get().addHistoryItem(commandStr, result.output, 'standard');
            } else {
                get().addHistoryItem(commandStr, (result as { success: false; error: Output | React.ReactNode; }).error, 'error');
            }
        } else if (result !== undefined && result !== null) {
            // Fallback for commands that might still return React.ReactNode directly
            get().addHistoryItem(commandStr, result as React.ReactNode, 'standard');
        }
      } else {
        get().addHistoryItem(commandStr, printError(`Command not found: '${commandName}'. Type 'help' for a list of commands.`), 'error');
      }
    } catch (error) {
      get().addHistoryItem(commandStr, printError(`Error executing command: ${(error as Error).message}`), 'error');
    } finally {
      set({ isBusy: false });
    }
  },
  
  setWelcomeMessage: (message) => set({ welcomeMessage: message }),

  registerCommand: (command) => {
    registry.register(command);
  },

  setCurrentPath: (path) => set({ currentPath: path }),

  // Input Actions
  setInputValue: (value) => set({ inputValue: value }),
  setHistoryIndex: (index) => set({ historyIndex: index }),
  setSuggestions: (suggestions) => set({ suggestions: suggestions }),
  setSuggestionIndex: (index) => set({ suggestionIndex: index }),
  resetInputState: () => set({ inputValue: '', historyIndex: -1, suggestions: [], suggestionIndex: -1 }),
  
  // Theme Actions
  setTheme: (themeNameOrObject: string | ThemeStyle): ThemeStyle | undefined => {
    const themes = get().themes;
    if (typeof themeNameOrObject === 'string') {
        if (themes[themeNameOrObject]) {
            set({ themeName: themeNameOrObject });
            return themes[themeNameOrObject];
        }
    } else {
        const newThemeName = themeNameOrObject.name || 'custom';
        const newThemes = { ...themes, [newThemeName]: { ...themes.default, ...themeNameOrObject } };
        set({ themes: newThemes, themeName: newThemeName });
        return newThemes[newThemeName];
    }
    return undefined;
  },
}));