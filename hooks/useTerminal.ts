import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import { parseCommand } from '../services/commandParser';
import { commandRegistry } from '../services/commandRegistry';
import { useTheme } from '../contexts/ThemeContext';

const useTerminal = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { theme, setThemeName, themes } = useTheme();
  
  const addHistory = useCallback((command: string, output: React.ReactNode) => {
    setHistory(prev => [...prev, { id: prev.length, command, output }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const WelcomeMessage = () => {
    const { theme } = useTheme();
    return React.createElement('div', null,
        React.createElement('p', { className: theme.textPrimary }, 'Welcome to Terminus!'),
        React.createElement('p', null, 'This is a React-based framework for building interactive TUIs.'),
        React.createElement('p', null, 
            'Type ',
            React.createElement('span', { className: theme.textSecondary }, "'help'"),
            ' to see a list of available commands.'
        )
    );
  };
  
  useEffect(() => {
    // We add a 'welcome' entry to history but show a component that will react to theme changes
    addHistory('session_start', React.createElement(WelcomeMessage));
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
        const availableThemes = Object.keys(themes);
        const context = { 
            clearHistory, 
            theme, 
            availableThemes,
            setTheme: (name: string): boolean => {
                if (availableThemes.includes(name)) {
                    setThemeName(name);
                    return true;
                }
                return false;
            }
        };

        const args = parseCommand(commandStr, command.args);
        const output = command.handler(args, context);
        // Only add to history if the command returns a visible output
        if (output !== undefined && output !== null) {
            addHistory(commandStr, output);
        }
      } catch (error) {
        addHistory(commandStr, React.createElement('p', { className: theme.textError }, `Error executing command: ${(error as Error).message}`));
      }
    } else {
      addHistory(commandStr, React.createElement('p', { className: theme.textError }, `Command not found: '${commandName}'. Type 'help' for a list of commands.`));
    }
  }, [addHistory, clearHistory, theme, themes, setThemeName]);

  return { history, submitCommand, commandHistory, setCommandHistory, terminalRef };
};

export default useTerminal;