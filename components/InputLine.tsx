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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        if (commandHistory[commandHistory.length - 1] !== value) {
            setCommandHistory(prev => [...prev, value]);
        }
        setHistoryIndex(-1);
      }
      setValue('');
    } else if (e.key === 'ArrowUp') {
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
        setValue(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Placeholder for autocomplete logic
    }
  };

  return (
    <div className="flex items-center w-full">
      <span className="text-green-400 mr-2">$</span>
      <input
        id="terminal-input"
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="bg-transparent border-none text-gray-200 focus:outline-none w-full"
        autoComplete="off"
        spellCheck="false"
      />
      <span className="w-2 h-5 bg-green-400 animate-blink"></span>
    </div>
  );
};

export default InputLine;
