import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSuggestions } from '../services/autocompleteService';
import { useTheme } from '../contexts/ThemeContext';

interface InputLineProps {
  onSubmit: (command: string) => void;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const InputLine: React.FC<InputLineProps> = ({ onSubmit, commandHistory, setCommandHistory }) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { theme } = useTheme();

  // This function reads from the DOM to calculate and imperatively set the cursor position.
  // By using a ref to update the style directly, we avoid re-rendering the component on every cursor move.
  const updateCursorPosition = useCallback(() => {
    if (!inputRef.current || !measurementRef.current || !cursorRef.current) return;
    
    const input = inputRef.current;
    const selectionStart = input.selectionStart ?? 0;
    const textBeforeCursor = input.value.substring(0, selectionStart);

    // Set the measurement span's content and get its width.
    measurementRef.current.textContent = textBeforeCursor;
    const newPosition = measurementRef.current.offsetWidth;

    // Directly manipulate the DOM for performance. No state change, no re-render.
    cursorRef.current.style.transform = `translateX(${newPosition}px)`;
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    updateCursorPosition();
  }, [updateCursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    // Reset autocomplete cycling on manual input
    setSuggestionIndex(-1);

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
      // Add to command history if it's not the same as the last command
      if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== trimmedValue) {
          setCommandHistory(prev => [...prev, trimmedValue]);
      }
      setHistoryIndex(-1); // Reset history navigation
    }
    setValue(''); // Clear input after submission
    setSuggestions([]);
    setSuggestionIndex(-1);
  };

  // Calculate the inline "ghost" hint for rendering.
  const wordToComplete = value.split(/\s+/).pop() || '';
  const firstSuggestion = suggestions[0];
  let inlineHint = '';
  // Only show hint if we are not actively cycling through suggestions with Tab.
  if (suggestionIndex === -1 && firstSuggestion && firstSuggestion.startsWith(wordToComplete) && firstSuggestion !== wordToComplete) {
    inlineHint = firstSuggestion.slice(wordToComplete.length);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length - 1;
        setHistoryIndex(newIndex);
        const newCommand = commandHistory[commandHistory.length - 1 - newIndex] || '';
        setValue(newCommand);
        setSuggestions([]);
        setSuggestionIndex(-1);
        
        requestAnimationFrame(() => {
          if(inputRef.current) {
            const end = inputRef.current.value.length;
            inputRef.current.setSelectionRange(end, end);
            updateCursorPosition();
          }
        });
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
        
        requestAnimationFrame(() => {
          if(inputRef.current) {
            const end = inputRef.current.value.length;
            inputRef.current.setSelectionRange(end, end);
            updateCursorPosition();
          }
        });
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

        requestAnimationFrame(() => {
            if (inputRef.current) {
                const end = inputRef.current.value.length;
                inputRef.current.setSelectionRange(end, end);
                updateCursorPosition();
            }
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <label htmlFor="terminal-input" className={`${theme.promptSymbol} mr-2`}>$</label>
      <div className="relative flex-1 h-5">
        <span
          ref={measurementRef}
          className="absolute invisible whitespace-pre"
          aria-hidden="true"
        >
        </span>
        
        {/* Visual Layer: Renders the user's text and the greyed-out suggestion */}
        <div className="absolute inset-0 pointer-events-none whitespace-pre overflow-hidden" aria-hidden="true">
            <span>{value}</span>
            <span className={theme.inlineHintText}>{inlineHint}</span>
        </div>

        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          // The input's own text is made transparent to see the visual layer underneath
          className="bg-transparent border-none text-transparent focus:outline-none w-full absolute inset-0 caret-transparent"
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* This is the fake blinking cursor, now positioned via ref */}
        <span
          ref={cursorRef}
          className={`w-2 h-5 ${theme.cursorBg} animate-blink absolute top-0`}
          aria-hidden="true"
        ></span>
      </div>
    </form>
  );
};

export default InputLine;
