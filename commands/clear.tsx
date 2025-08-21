import { Command, CommandResult } from '../types';

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls', 'clr'],
  description: 'Clears the terminal screen',
  category: 'System',
  handler: (args, context): CommandResult => {
    context.clear();
    return { success: true, output: null };
  }
};