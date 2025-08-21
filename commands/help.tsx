import React from 'react';
import { Command, CommandArg } from '../types';
import { commandRegistry } from '../services/commandRegistry';

const renderCommandHelp = (cmd: Command) => {
    const renderArgs = (args: CommandArg[] | undefined) => {
        if (!args || args.length === 0) {
            return <p className="text-gray-400">This command takes no arguments.</p>;
        }
        return (
            <ul className="list-disc list-inside ml-2">
                {args.map(arg => {
                    const alias = arg.alias ? `, -${arg.alias}` : '';
                    const name = arg.variadic ? `${arg.name}...` : `--${arg.name}`;
                    const nameDisplay = arg.variadic ? arg.name : name;

                    return (
                        <li key={arg.name}>
                             <span className="text-cyan-400 w-36 inline-block">{nameDisplay}{alias}</span>
                             <span className="text-gray-400">- {arg.description} {arg.required && <span className="text-red-400">(required)</span>}</span>
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <div>
            <p><span className="font-bold text-green-400">{cmd.name}</span> - <span className="italic">{cmd.description}</span></p>
            {cmd.aliases && cmd.aliases.length > 0 && <p className="text-gray-400 mt-1">Aliases: {cmd.aliases.join(', ')}</p>}
            <p className="font-bold mt-2 text-yellow-300">Usage:</p>
            {renderArgs(cmd.args)}
        </div>
    )
}

const renderAllCommands = () => {
    const commands = commandRegistry.getAll()
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
        <div>
            <p className="font-bold mb-2 text-yellow-300">Available Commands:</p>
            <ul className="list-disc list-inside">
            {commands.map(cmd => (
                <li key={cmd.name}>
                <span className="text-green-400 font-semibold w-24 inline-block">{cmd.name}</span>
                <span className="text-gray-400">- {cmd.description}</span>
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
  handler: (args) => {
    const commandName = args._?.[0];

    if (commandName) {
        const commandToHelp = commandRegistry.get(commandName as string);
        if (commandToHelp) {
            return renderCommandHelp(commandToHelp);
        } else {
            return <p className="text-red-500">Command '{commandName}' not found.</p>;
        }
    }

    return renderAllCommands();
  },
};