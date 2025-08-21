import { helpCommand } from './help';
import { clearCommand } from './clear';
import { echoCommand } from './echo';
import { themeCommand } from './theme';
import { addCommand, subtractCommand, multiplyCommand, divideCommand } from './calculator';
import { Command } from '../types';

export const defaultCommands: Command[] = [
  helpCommand,
  clearCommand,
  echoCommand,
  themeCommand,
  addCommand,
  subtractCommand,
  multiplyCommand,
  divideCommand,
];
