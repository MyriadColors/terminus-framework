import { Command, CommandArg } from '../types';

export const helpCommand: Command = {
  name: 'help',
  description: 'Displays a list of available commands or details about a specific command.',
  aliases: ['h', '?'],
  category: 'System',
  handler: (args, context) => {
    const commandName = args._?.[0];

    if (commandName) {
        const commandToHelp = context.getCommand(commandName as string);
        if (commandToHelp) {
            const { name, description, aliases, args: commandArgs } = commandToHelp;
            
            // Build lines with appropriate styling
            const lines = [
                { text: `${name} - ${description}`, styleType: 'textPrimary' }
            ];
            
            if (aliases && aliases.length > 0) {
                lines.push({ text: `Aliases: ${aliases.join(', ')}`, styleType: 'textFaded' });
            }
            
            lines.push({ text: '', styleType: 'textPrimary' }); // Empty line
            lines.push({ text: 'Usage:', styleType: 'textSecondary' });
            
            if (!commandArgs || commandArgs.length === 0) {
                lines.push({ text: 'This command takes no arguments.', styleType: 'textFaded' });
            } else {
                commandArgs.forEach(arg => {
                    const alias = arg.alias ? `, -${arg.alias}` : '';
                    const name = arg.variadic ? `${arg.name}...` : `--${arg.name}`;
                    const nameDisplay = arg.variadic ? arg.name : name;
                    const required = arg.required ? " (required)" : "";
                    
                    lines.push({
                        text: `  ${nameDisplay}${alias} - ${arg.description}${required}`,
                        styleType: arg.required ? 'textError' : 'textFaded'
                    });
                });
            }
            
            return { success: true, output: context.printMultiLine(lines) };
        } else {
            return { success: false, error: context.printError(`Command '${commandName}' not found.`) };
        }
    }

    // List all commands grouped by category
    const commands = context.getAllCommands()
      .sort((a, b) => a.name.localeCompare(b.name));
      
    // Group commands by category
    const categorizedCommands: Record<string, typeof commands> = {};
    const uncategorized: typeof commands = [];
    
    commands.forEach(cmd => {
      if (cmd.category) {
        if (!categorizedCommands[cmd.category]) {
          categorizedCommands[cmd.category] = [];
        }
        categorizedCommands[cmd.category].push(cmd);
      } else {
        uncategorized.push(cmd);
      }
    });
    
    // Create list items with command names in textSecondary and descriptions in textFaded
    const commandSections = [];
    
    // Add categorized commands
    Object.keys(categorizedCommands)
      .sort()
      .forEach(category => {
        const categoryCommands = categorizedCommands[category];
        commandSections.push({ 
          content: `[${category} Commands]`, 
          styleType: 'textTertiary',
          className: 'font-bold'
        });
        
        categoryCommands.forEach(cmd => {
          commandSections.push({
            content: '', // Will be rendered via parts
            parts: [
              { text: `  ${cmd.name}`, styleType: 'textSecondary' },
              { text: ` - ${cmd.description}`, styleType: 'textFaded' }
            ]
          });
        });
        
        // Add extra spacing between categories
        commandSections.push({ content: '', styleType: 'textPrimary' }); // Empty line
        commandSections.push({ content: '', styleType: 'textPrimary' }); // Extra empty line for spacing
      });
    
    // Add uncategorized commands if any
    if (uncategorized.length > 0) {
      commandSections.push({ 
        content: '[Other Commands]', 
        styleType: 'textTertiary',
        className: 'font-bold'
      });
      
      uncategorized.forEach(cmd => {
        commandSections.push({
          content: '', // Will be rendered via parts
          parts: [
            { text: `  ${cmd.name}`, styleType: 'textSecondary' },
            { text: ` - ${cmd.description}`, styleType: 'textFaded' }
          ]
        });
      });
      
      // Add extra spacing
      commandSections.push({ content: '', styleType: 'textPrimary' }); // Empty line
      commandSections.push({ content: '', styleType: 'textPrimary' }); // Extra empty line for spacing
    }
    
    const header = { content: 'Available Commands:', styleType: 'textSecondary' };
    const instruction = { content: "Type 'help [command]' for more details on a specific command.", styleType: 'textFaded' };
    
    return { 
        success: true, 
        output: context.printList([
            header,
            ...commandSections,
            instruction
        ], { ordered: false })
    };
  },
};