
import { useState, RefObject } from 'react';
import { getSuggestions } from '../services/autocompleteService';

interface UseCommandInputProps {
  onSubmit: (command: string) => void;
  commandHistory: string[];
  addCommandToHistory: (command: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  updateCursorPosition: () => void;
}

export const useCommandInput = ({
  onSubmit,
  commandHistory,
  addCommandToHistory,
  inputRef,
  updateCursorPosition
}: UseCommandInputProps) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSuggestionIndex(-1); // Reset autocomplete cycling

    if (newValue) {
      setSuggestions(getSuggestions(newValue));
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
      setHistoryIndex(-1);
    }
    setValue('');
    setSuggestions([]);
    setSuggestionIndex(-1);
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
        setValue(newCommand);
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
        setValue(newCommand);
        setSuggestions([]);
        setSuggestionIndex(-1);
        moveCursorToEnd();
      }
    } else if (e.key === 'ArrowRight' && inlineHint && inputRef.current?.selectionStart === value.length) {
        // Accept inline suggestion with ArrowRight if cursor is at the end
        e.preventDefault();
        setValue(value + inlineHint);
    } else if (e.key === 'Tab') {
        e.preventDefault();
        
        // If there's an inline hint, the first tab accepts it.
        if (inlineHint && inputRef.current?.selectionStart === value.length) {
            setValue(value + inlineHint);
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

        setValue(newValue);
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