import { Command } from '../types';

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clears the terminal screen.',
  aliases: ['cls'],
  handler: (args, context) => {
    context.clearHistory();
    return null;
  }
};