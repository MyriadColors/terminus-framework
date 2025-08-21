import React from 'react';
import type { ThemeStyle } from './styles/themes';

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

/**
 * The context object passed to every command handler, providing APIs
 * to interact with the terminal.
 */
export interface CommandContext {
  clear: () => void;
  theme: ThemeStyle;
  setTheme: (themeName: string) => ThemeStyle | undefined;
  availableThemes: string[];
  getAllCommands: () => Command[];
  getCommand: (name: string) => Command | undefined;
}

export type CommandHandler = (
    args: Record<string, any>,
    context: CommandContext
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