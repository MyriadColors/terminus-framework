import { Command, CommandArg, CommandResult } from '../types';

export const echoCommand: Command = {
  name: 'echo',
  description: 'Displays the specified text',
  category: 'System',
  args: [
    {
      name: 'text',
      description: 'The text to display',
      required: true,
      variadic: true
    },
    {
      name: 'uppercase',
      alias: 'u',
      description: 'Convert text to uppercase',
      required: false,
      type: 'boolean'
    }
  ] as CommandArg[],
  handler: (args, context): CommandResult => {
    let text = args._?.join(' ') || '';
    
    // Convert to uppercase if the flag is present
    if (args.uppercase || args.u) {
      text = text.toUpperCase();
    }
    
    return { 
      success: true, 
      output: context.printLine(text) 
    };
  }
};
