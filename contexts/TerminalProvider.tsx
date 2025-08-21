
import React, { useEffect, useCallback } from 'react';
import { Command } from '../types';
import { CommandRegistry } from '../services/commandRegistry';
import { ThemeStyle } from '../styles/themes';
import { TerminalContextProvider } from './TerminalContext';
import { createTerminalStore } from '../store/terminalStore';

interface TerminalProviderProps {
  children: React.ReactNode;
  commands: Command[];
  welcomeMessage?: React.ReactNode;
  initialTheme?: string;
  themes?: Record<string, ThemeStyle>;
}

const TerminalProvider: React.FC<TerminalProviderProps> = ({
  children,
  commands,
  welcomeMessage,
  initialTheme = 'default',
  themes = {},
}) => {
  const registry = new CommandRegistry();
  const store = createTerminalStore({
      registry,
      initialTheme,
      customThemes: themes,
      welcomeMessage,
  });

  // Register initial commands
  useEffect(() => {
      commands.forEach(cmd => registry.register(cmd));
  }, [commands]);

  const registerCommand = useCallback((command: Command) => {
      registry.register(command);
      // Optionally, if you want to trigger a re-render or update the store with the new command list
      // store.getState().setCommands(registry.getAll()); // Assuming you add a setCommands to your store
  }, []);

  // Effect to update welcome message when prop changes
  useEffect(() => {
      store.getState().setWelcomeMessage(welcomeMessage);
  }, [welcomeMessage]);
  
  const contextValue = { store, registry, registerCommand };

  return (
    <TerminalContextProvider value={contextValue}>
      {children}
    </TerminalContextProvider>
  );
};

export default TerminalProvider;