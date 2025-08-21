
import React, { useRef, useEffect, useState } from 'react';
import { HistoryItem, Command } from '../types';
import { CommandRegistry } from '../services/commandRegistry';
import { ThemeStyle } from '../styles/themes';
import { TerminalContextProvider, useTerminalStore } from '../contexts/TerminalContext';
import { createTerminalStore, FullStoreState } from '../store/terminalStore';
import type { StoreApi, UseBoundStore } from 'zustand';
import InputLine from './InputLine';

const OutputLine: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  return (
    <div>
      <div className="flex items-center">
        <span className={`${theme.promptSymbol} mr-2`}>$</span>
        <span className="flex-1">{item.command}</span>
      </div>
      <div className="leading-snug">{item.output}</div>
    </div>
  );
};

const TerminalDisplay: React.FC<{ welcomeMessage?: React.ReactNode }> = ({ welcomeMessage }) => {
  const { history, addHistoryItem, submitCommand, addCommandToHistory, theme } = useTerminalStore((state) => ({
    history: state.history,
    addHistoryItem: state.addHistoryItem,
    submitCommand: state.submitCommand,
    addCommandToHistory: state.addCommandToHistory,
    theme: state.themes[state.themeName] || state.themes.default,
  }));
  
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (welcomeMessage && history.length === 0) {
      addHistoryItem('session_start', welcomeMessage);
    }
  }, [welcomeMessage, addHistoryItem, history.length]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div 
      ref={terminalRef} 
      className={`w-full h-[60vh] p-4 overflow-y-auto ${theme.terminalBg} ${theme.terminalText} rounded-lg border-2 ${theme.terminalBorder} focus:outline-none focus:ring-2 ${theme.terminalFocusRing} transition-all duration-300`}
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      {history.map((item) => (
        <OutputLine key={item.id} item={item} />
      ))}
      <InputLine 
        onSubmit={submitCommand}
        addCommandToHistory={addCommandToHistory}
      />
    </div>
  );
};


interface TerminalProps {
  commands: Command[];
  welcomeMessage?: React.ReactNode;
  themeName?: string;
  onThemeChange?: (name: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ 
  commands, 
  welcomeMessage,
  themeName = 'default',
  onThemeChange = () => {}
}) => {
  const [{ store, registry }] = useState(() => {
    const registry = new CommandRegistry();
    const store = createTerminalStore(registry, onThemeChange);
    return { store, registry };
  });

  useEffect(() => {
    registry.clear();
    commands.forEach(cmd => registry.register(cmd));
  }, [commands, registry]);

  useEffect(() => {
    const internalThemeName = store.getState().themeName;
    if (internalThemeName !== themeName) {
      store.getState()._setThemeNameInternal(themeName);
    }
  }, [themeName, store]);
  
  const contextValue = { store, registry };

  return (
    <TerminalContextProvider value={contextValue}>
      <TerminalDisplay welcomeMessage={welcomeMessage} />
    </TerminalContextProvider>
  );
};

export default Terminal;