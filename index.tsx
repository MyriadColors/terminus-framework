/**
 * Terminus TUI Framework - Public API
 */

// Core Components for rendering the terminal
export { default as TerminalProvider } from './contexts/TerminalProvider';
export { default as TerminalView } from './components/TerminalView';

// Main hook for programmatic control over the terminal
export { useTerminal } from './hooks/useTerminal';
export type { UseTerminalResult, TerminalState, TerminalActions } from './hooks/useTerminal';

// Public types for creating commands and custom themes
export type { 
    Command, 
    CommandArg, 
    CommandHandler,
    CommandContext,
    HistoryItem, 
    ThemeStyle 
} from './types';