
import React, { useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import { ThemeStyle } from '../styles/themes';
import { useTerminalStore } from '../contexts/TerminalContext';
import InputLine from './InputLine';

const OutputLine: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  
  // Do not render a prompt line for special commands like session_start or for programmatically printed messages.
  const isProgrammatic = item.command === 'session_start' || item.command === 'programmatic_print';
  if (isProgrammatic) {
    return <div className="leading-snug">{item.output}</div>;
  }

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

const TerminalView: React.FC = () => {
  const { history, addHistoryItem, submitCommand, addCommandToHistory, theme, welcomeMessage } = useTerminalStore((state) => ({
    history: state.history,
    addHistoryItem: state.addHistoryItem,
    submitCommand: state.submitCommand,
    addCommandToHistory: state.addCommandToHistory,
    theme: state.themes[state.themeName] || state.themes.default,
    welcomeMessage: state.welcomeMessage,
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
      role="log"
      aria-live="polite"
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

export default TerminalView;