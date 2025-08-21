import { Command, CommandArg } from '../types';

export const helpCommand: Command = {
  name: 'help',
  description: 'Displays a list of available commands or details about a specific command.',
  aliases: ['h', '?'],
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

    // List all commands
    const commands = context.getAllCommands()
      .sort((a, b) => a.name.localeCompare(b.name));
      
    const lines = [
        { text: 'Available Commands:', styleType: 'textSecondary' }
    ];
    
    commands.forEach(cmd => {
        lines.push({ text: `${cmd.name} - ${cmd.description}`, styleType: 'textPrimary' });
    });
    
    lines.push({ text: '', styleType: 'textPrimary' }); // Empty line
    lines.push({ text: "Type 'help [command]' for more details on a specific command.", styleType: 'textFaded' });
    
    return { success: true, output: context.printMultiLine(lines) };
  },
};