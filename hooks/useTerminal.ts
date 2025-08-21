
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryItem, Command } from '../types';
import { parseCommand } from '../services/commandParser';

const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const commands = useRef<Map<string, Command>>(new Map());

  const addHistory = useCallback((command: string, output: React.ReactNode) => {
    setHistory(prev => [...prev, { id: prev.length, command, output }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const welcomeMessage = React.createElement('div', null,
    React.createElement('p', { className: "text-green-400" }, "Welcome to Terminus!"),
    React.createElement('p', null, "This is a React-based framework for building interactive TUIs."),
    React.createElement('p', null, "Type ", React.createElement('span', { className: "text-yellow-400" }, "'help'"), " to see a list of available commands.")
  );

  useEffect(() => {
    const registerCommand = (command: Command) => {
        commands.current.set(command.name, command);
        if (command.aliases) {
          command.aliases.forEach(alias => commands.current.set(alias, command));
        }
    };
      
    registerCommand({
      name: 'help',
      description: 'Displays a list of available commands.',
      handler: () => (
        React.createElement('div', null,
          React.createElement('p', { className: "font-bold mb-2 text-yellow-300" }, "Available Commands:"),
          React.createElement('ul', { className: "list-disc list-inside" },
            ...Array.from(commands.current.values())
              .filter((c, i, self) => self.findIndex(cmd => cmd.name === c.name) === i) // Unique commands
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(cmd => (
              React.createElement('li', { key: cmd.name },
                React.createElement('span', { className: "text-green-400 font-semibold w-24 inline-block" }, cmd.name),
                React.createElement('span', { className: "text-gray-400" }, `- ${cmd.description}`)
              )
            ))
          )
        )
      ),
    });

    registerCommand({
      name: 'clear',
      description: 'Clears the terminal screen.',
      aliases: ['cls'],
      handler: () => {
        clearHistory();
        return React.createElement('p', { className: "text-gray-500" }, "Terminal cleared.");
      }
    });

    registerCommand({
      name: 'echo',
      description: 'Prints the given text back to the terminal.',
      handler: (args) => React.createElement('p', null, Object.values(args).join(' '))
    });

    addHistory('welcome', welcomeMessage);
  }, [addHistory, clearHistory]);
  
  const submitCommand = useCallback((commandStr: string) => {
    const { commandName, args } = parseCommand(commandStr);
    const command = commands.current.get(commandName);

    if (command) {
      try {
        const output = command.handler(args);
        addHistory(commandStr, output);
      } catch (error) {
        addHistory(commandStr, React.createElement('p', { className: "text-red-500" }, `Error executing command: ${(error as Error).message}`));
      }
    } else {
      addHistory(commandStr, React.createElement('p', { className: "text-red-500" }, `Command not found: '${commandName}'. Type 'help' for a list of commands.`));
    }
  }, [addHistory]);

  return { history, submitCommand, commandHistory, setCommandHistory, terminalRef };
};

export default useTerminal;