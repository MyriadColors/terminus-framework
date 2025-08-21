
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import { parseCommand } from '../services/commandParser';
import { commandRegistry } from '../services/commandRegistry';

const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const addHistory = useCallback((command: string, output: React.ReactNode) => {
    setHistory(prev => [...prev, { id: prev.length, command, output }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const welcomeMessage = React.createElement('div', null,
    React.createElement('p', { className: "text-green-400" }, 'Welcome to Terminus!'),
    React.createElement('p', null, 'This is a React-based framework for building interactive TUIs.'),
    React.createElement('p', null, 'Type ', React.createElement('span', { className: "text-yellow-400" }, "'help'"), ' to see a list of available commands.')
  );

  useEffect(() => {
    addHistory('welcome', welcomeMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const submitCommand = useCallback((commandStr: string) => {
    const commandName = commandStr.trim().split(/\s+/)[0] || '';
    
    if (!commandName) {
        return;
    }

    const command = commandRegistry.get(commandName);

    if (command) {
      try {
        const args = parseCommand(commandStr, command.args);
        const context = { clearHistory };
        const output = command.handler(args, context);
        // Only add to history if the command returns a visible output
        if (output !== undefined && output !== null) {
            addHistory(commandStr, output);
        }
      } catch (error) {
        addHistory(commandStr, React.createElement('p', { className: "text-red-500" }, `Error executing command: ${(error as Error).message}`));
      }
    } else {
      addHistory(commandStr, React.createElement('p', { className: "text-red-500" }, `Command not found: '${commandName}'. Type 'help' for a list of commands.`));
    }
  }, [addHistory, clearHistory]);

  return { history, submitCommand, commandHistory, setCommandHistory, terminalRef };
};

export default useTerminal;