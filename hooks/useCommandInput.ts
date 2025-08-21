
import { RefObject } from 'react';
import { getSuggestions } from '../services/autocompleteService';
import { useTerminalStore, useCommandRegistry } from '../contexts/TerminalContext';

interface UseCommandInputProps {
  onSubmit: (command: string) => void;
  addCommandToHistory: (command: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  updateCursorPosition: () => void;
}

export const useCommandInput = ({
  onSubmit,
  addCommandToHistory,
  inputRef,
  updateCursorPosition
}: UseCommandInputProps) => {
  const registry = useCommandRegistry();
  const {
    inputValue: value,
    historyIndex,
    suggestions,
    suggestionIndex,
    commandHistory,
    setInputValue,
    setHistoryIndex,
    setSuggestions,
    setSuggestionIndex,
    resetInputState,
  } = useTerminalStore((state) => ({
    inputValue: state.inputValue,
    historyIndex: state.historyIndex,
    suggestions: state.suggestions,
    suggestionIndex: state.suggestionIndex,
    commandHistory: state.commandHistory,
    setInputValue: state.setInputValue,
    setHistoryIndex: state.setHistoryIndex,
    setSuggestions: state.setSuggestions,
    setSuggestionIndex: state.setSuggestionIndex,
    resetInputState: state.resetInputState,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSuggestionIndex(-1); // Reset autocomplete cycling

    if (newValue) {
      setSuggestions(getSuggestions(newValue, registry));
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSubmit(trimmedValue);
      addCommandToHistory(trimmedValue);
    }
    resetInputState();
    
    // Refocus the input after command submission
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  
  // Calculate the inline "ghost" hint for rendering.
  const wordToComplete = value.split(/\s+/).pop() || '';
  const firstSuggestion = suggestions[0];
  let inlineHint = '';
  if (suggestionIndex === -1 && firstSuggestion && firstSuggestion.startsWith(wordToComplete) && firstSuggestion !== wordToComplete) {
    inlineHint = firstSuggestion.slice(wordToComplete.length);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Helper to move cursor to the end and update its visual position after programmatic changes.
    const moveCursorToEnd = () => {
      requestAnimationFrame(() => {
        if(inputRef.current) {
          const end = inputRef.current.value.length;
          inputRef.current.setSelectionRange(end, end);
          updateCursorPosition();
        }
      });
    };

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length - 1;
        setHistoryIndex(newIndex);
        const newCommand = commandHistory[commandHistory.length - 1 - newIndex] || '';
        setInputValue(newCommand);
        setSuggestions([]);
        setSuggestionIndex(-1);
        moveCursorToEnd();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        let newCommand = '';
        if (newIndex >= 0) {
          newCommand = commandHistory[commandHistory.length - 1 - newIndex] || '';
        }
        setInputValue(newCommand);
        setSuggestions([]);
        setSuggestionIndex(-1);
        moveCursorToEnd();
      }
    } else if (e.key === 'ArrowRight' && inlineHint && inputRef.current?.selectionStart === value.length) {
        // Accept inline suggestion with ArrowRight if cursor is at the end
        e.preventDefault();
        setInputValue(value + inlineHint);
    } else if (e.key === 'Tab') {
        e.preventDefault();
        
        // If there's an inline hint, the first tab accepts it.
        if (inlineHint && inputRef.current?.selectionStart === value.length) {
            setInputValue(value + inlineHint);
            return;
        }

        if (suggestions.length === 0) return;

        const newIndex = suggestionIndex === -1 ? 0 : (suggestionIndex + 1) % suggestions.length;
        setSuggestionIndex(newIndex);

        const suggestion = suggestions[newIndex];
        const parts = value.trimStart().split(/\s+/);
        
        const isCompletingCommand = parts.length === 1 && !value.endsWith(' ');
        
        let newValue: string;
        if (isCompletingCommand) {
            newValue = suggestion + ' ';
        } else {
            parts[parts.length - 1] = suggestion;
            newValue = parts.join(' ') + ' ';
        }

        setInputValue(newValue);
        moveCursorToEnd();
    }
  };

  return {
    value,
    inlineHint,
    handleChange,
    handleSubmit,
    handleKeyDown,
  };
};