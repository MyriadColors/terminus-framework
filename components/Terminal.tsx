
import React, { useRef, useEffect } from 'react';
import { useTerminalStore } from '../store/terminalStore';
import InputLine from './InputLine';
import { HistoryItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const OutputLine: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const { theme } = useTheme();
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

const Terminal: React.FC = () => {
  const { history, submitCommand, initialize } = useTerminalStore();
  const commandHistory = useTerminalStore((state) => state.commandHistory);
  const addCommandToHistory = useTerminalStore((state) => state.addCommandToHistory);
  
  const { theme, setThemeName, themes } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (command: string) => {
    submitCommand(command, { theme, setThemeName, themes });
  };

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
        onSubmit={handleSubmit}
        commandHistory={commandHistory}
        addCommandToHistory={addCommandToHistory}
      />
    </div>
  );
};

export default Terminal;