import React from 'react';
import type { ThemeStyle } from './styles/themes';
import { CommandRegistry } from './services/commandRegistry';

export type { ThemeStyle };

export interface CommandArg {
  name: string;
  description: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  alias?: string;
  variadic?: boolean;
  type?: 'string' | 'number' | 'boolean';
}

export interface TerminalContext {
  clearHistory: () => void;
  theme: ThemeStyle;
  setTheme: (themeName: string) => ThemeStyle | undefined;
  availableThemes: string[];
  registry: CommandRegistry;
}

export type CommandHandler = (
    args: Record<string, any>,
    context: TerminalContext
) => React.ReactNode;

export interface Command {
  name: string;
  description: string;
  args?: CommandArg[];
  handler: CommandHandler;
  aliases?: string[];
}

export interface HistoryItem {
  id: number;
  command: string;
  output: React.ReactNode;
}