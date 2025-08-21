import { Command, CommandArg, CommandContext } from '../types';

const renderCommandHelp = (cmd: Command, context: CommandContext) => {
    const { theme } = context;
    const renderArgs = (args: CommandArg[] | undefined) => {
        if (!args || args.length === 0) {
            return <p className={theme.textFaded}>This command takes no arguments.</p>;
        }
        return (
            <ul className="list-disc list-inside ml-2">
                {args.map(arg => {
                    const alias = arg.alias ? `, -${arg.alias}` : '';
                    const name = arg.variadic ? `${arg.name}...` : `--${arg.name}`;
                    const nameDisplay = arg.variadic ? arg.name : name;

                    return (
                        <li key={arg.name}>
                             <span className={`${theme.textTertiary} w-36 inline-block`}>{nameDisplay}{alias}</span>
                             <span className={theme.textFaded}>- {arg.description} {arg.required && <span className={theme.textError}>(required)</span>}</span>
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <div>
            <p><span className={`font-bold ${theme.textPrimary}`}>{cmd.name}</span> - <span className="italic">{cmd.description}</span></p>
            {cmd.aliases && cmd.aliases.length > 0 && <p className={`${theme.textFaded} mt-1`}>Aliases: {cmd.aliases.join(', ')}</p>}
            <p className={`font-bold mt-2 ${theme.textSecondary}`}>Usage:</p>
            {renderArgs(cmd.args)}
        </div>
    )
}

const renderAllCommands = (context: CommandContext) => {
    const { theme } = context;
    const commands = context.getAllCommands()
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
        <div>
            <p className={`font-bold mb-2 ${theme.textSecondary}`}>Available Commands:</p>
            <ul className="list-disc list-inside">
            {commands.map(cmd => (
                <li key={cmd.name}>
                <span className={`${theme.textPrimary} font-semibold w-24 inline-block`}>{cmd.name}</span>
                <span className={theme.textFaded}>- {cmd.description}</span>
                </li>
            ))}
            </ul>
            <p className="mt-4 text-gray-500">Type 'help [command]' for more details on a specific command.</p>
        </div>
    );
}

export const helpCommand: Command = {
  name: 'help',
  description: 'Displays a list of available commands or details about a specific command.',
  aliases: ['h', '?'],
  handler: (args, context) => {
    const commandName = args._?.[0];

    if (commandName) {
        const commandToHelp = context.getCommand(commandName as string);
        if (commandToHelp) {
            return { success: true, output: renderCommandHelp(commandToHelp, context) };
        } else {
            return { success: false, error: <p className={context.theme.textError}>Command '{commandName}' not found.</p> };
        }
    }

    return { success: true, output: renderAllCommands(context) };
  },
};