import React from 'react';

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean;
}

export type CommandHandler = (args: Record<string, string | number | boolean>) => React.ReactNode;

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
