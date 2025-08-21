
import React, { useRef, useEffect } from 'react';
import { useTerminalStore } from '../store/terminalStore';
import InputLine from './InputLine';
import { HistoryItem, Command } from '../types';
import { commandRegistry } from '../services/commandRegistry';
import { ThemeStyle } from '../styles/themes';

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

interface TerminalProps {
  commands: Command[];
  welcomeMessage?: React.ReactNode;
}

const Terminal: React.FC<TerminalProps> = ({ commands, welcomeMessage }) => {
  const { history, submitCommand, addHistoryItem } = useTerminalStore();
  const addCommandToHistory = useTerminalStore((state) => state.addCommandToHistory);
  const theme = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commandRegistry.clear();
    commands.forEach(cmd => commandRegistry.register(cmd));
    return () => commandRegistry.clear();
  }, [commands]);

  useEffect(() => {
    // Show welcome message only if history is empty.
    // This prevents it from reappearing on hot-reloads or other re-renders.
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

export default Terminal;
