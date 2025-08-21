import { helpCommand } from './help';
import { clearCommand } from './clear';
import { echoCommand } from './echo';
import { themeCommand } from './theme';
import { Command } from '../types';

export const defaultCommands: Command[] = [
  helpCommand,
  clearCommand,
  echoCommand,
  themeCommand,
];
