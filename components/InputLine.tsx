import React, { useState, useEffect, useRef } from 'react';

interface InputLineProps {
  onSubmit: (command: string) => void;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const InputLine: React.FC<InputLineProps> = ({ onSubmit, commandHistory, setCommandHistory }) => {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update cursor position whenever the input value changes
  useEffect(() => {
    if (measurementRef.current) {
      setCursorPosition(measurementRef.current.offsetWidth);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : commandHistory.length - 1;
        setHistoryIndex(newIndex);
        setValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (newIndex >= 0) {
          setValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
        } else {
          setValue(''); // Cleared value when going past the oldest command
        }
      }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Placeholder for autocomplete logic
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <label htmlFor="terminal-input" className="text-green-400 mr-2">$</label>
      <div className="relative flex-1 h-5">
        {/* 
          This hidden span has the same content and font styles as the input.
          We use it to measure the width of the text to position our fake cursor.
        */}
        <span
          ref={measurementRef}
          className="absolute invisible whitespace-pre text-gray-200"
          aria-hidden="true"
        >
          {value}
        </span>

        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none text-gray-200 focus:outline-none w-full absolute inset-0 caret-transparent"
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* This is the fake blinking cursor, positioned based on the measured text width */}
        <span
          className="w-2 h-5 bg-green-400 animate-blink absolute top-0"
          style={{ transform: `translateX(${cursorPosition}px)` }}
          aria-hidden="true"
        ></span>
      </div>
    </form>
  );
};

export default InputLine;
