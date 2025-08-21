import React, { useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import { ThemeStyle } from '../styles/themes';
import { useTerminalStore } from '../contexts/TerminalContext';
import InputLine from './InputLine';

const DefaultHistoryItem: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  
  const isProgrammatic = item.command === 'session_start' || item.command === 'programmatic_print';
  const outputClassName = item.type === 'error' ? theme.textError : '';

  if (isProgrammatic) {
    return <div className={`leading-snug ${outputClassName}`}>{item.output}</div>;
  }

  return (
    <div>
      <div className="flex items-center">
        <span className={`${theme.promptSymbol} mr-2`}>$</span>
        <span className="flex-1">{item.command}</span>
      </div>
      <div className={`leading-snug ${outputClassName}`}>{item.output}</div>
    </div>
  );
};

const OutputLine: React.FC<{ item: HistoryItem, renderHistoryItem?: (item: HistoryItem) => React.ReactNode }> = ({ item, renderHistoryItem }) => {
  if (renderHistoryItem) {
    return <>{renderHistoryItem(item)}</>;
  }
  return <DefaultHistoryItem item={item} />;
};

const DefaultPrompt: React.FC<{ path: string }> = ({ path }) => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  return (
    <span className={`${theme.promptSymbol} mr-2`}>
      <span className="font-bold">user@terminus</span>:<span className="text-blue-400">{path}</span>$
    </span>
  );
};

interface TerminalViewProps {
  renderPrompt?: (path: string) => React.ReactNode;
  renderHistoryItem?: (item: HistoryItem) => React.ReactNode;
}

const TerminalView: React.FC<TerminalViewProps> = ({ renderPrompt, renderHistoryItem }) => {
  const { history, addHistoryItem, submitCommand, addCommandToHistory, theme, welcomeMessage, currentPath } = useTerminalStore((state) => ({
    history: state.history,
    addHistoryItem: state.addHistoryItem,
    submitCommand: state.submitCommand,
    addCommandToHistory: state.addCommandToHistory,
    theme: state.themes[state.themeName] || state.themes.default,
    welcomeMessage: state.welcomeMessage,
    currentPath: state.currentPath,
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
      {history.map((item: HistoryItem) => (
        <OutputLine
          key={item.id}
          item={item}
          renderHistoryItem={renderHistoryItem}
        />
      ))}
      <InputLine 
        onSubmit={submitCommand}
        addCommandToHistory={addCommandToHistory}
        renderPrompt={() => renderPrompt ? renderPrompt(currentPath) : <DefaultPrompt path={currentPath} />}
      />
    </div>
  );
};

export default TerminalView;