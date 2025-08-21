import React from 'react';
import type { ThemeStyle } from './styles/themes';
import { 
  Output, 
  OutputType, 
  OutputContent, 
  OutputConfig, 
  isOutputObject,
  TextContent,
  ListItem,
  ListContent,
  TableContent,
  JsonContent,
  CustomContent
} from './types/outputTypes';

export type { 
  ThemeStyle,
  Output,
  OutputType,
  OutputContent,
  OutputConfig,
  TextContent,
  ListItem,
  ListContent,
  TableContent,
  JsonContent,
  CustomContent
};

export { isOutputObject };

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
  setCurrentPath: (path: string) => void;
  // Helper functions for creating output objects
  printLine: (content: string, config?: OutputConfig) => Output;
  printMultiLine: (lines: Array<{ text: string; styleType?: string; className?: string }>, config?: OutputConfig) => Output;
  printSuccess: (content: string, config?: OutputConfig) => Output;
  printError: (content: string, config?: OutputConfig) => Output;
  printWarning: (content: string, config?: OutputConfig) => Output;
  printCode: (content: string, config?: OutputConfig) => Output;
  printList: (items: Array<{ content: string; type?: 'success' | 'warning' | 'error' | 'default'; styleType?: string; className?: string }>, config?: OutputConfig) => Output;
  printTable: (data: { headers: string[]; rows: string[][] }, config?: OutputConfig) => Output;
  printJson: (data: any, config?: OutputConfig) => Output;
  printMarkdown: (content: string, config?: OutputConfig) => Output;
  printCustom: (content: React.ReactNode, config?: OutputConfig) => Output;
}

export type CommandHandler = (
    args: Record<string, any>,
    context: CommandContext
) => CommandResult | Promise<CommandResult>;

export interface Command {
  name: string;
  description: string;
  args?: CommandArg[];
  handler: CommandHandler;
  aliases?: string[];
  category?: string;
}

export type CommandResult = {
  success: true;
  output: Output | React.ReactNode; // Allow both new Output objects and legacy React nodes during transition
} | {
  success: false;
  error: Output | React.ReactNode; // Allow both new Output objects and legacy React nodes during transition
};

export function isCommandResult(obj: any): obj is CommandResult {
  return obj && typeof obj === 'object' && 'success' in obj;
}

// Updated to support both legacy and new output formats
export interface HistoryItem {
  id: number;
  command: string;
  output: Output | React.ReactNode;
  type: 'standard' | 'error';
}