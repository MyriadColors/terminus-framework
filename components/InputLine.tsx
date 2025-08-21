import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useCommandInput } from '../hooks/useCommandInput';

interface InputLineProps {
  onSubmit: (command: string) => void;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const InputLine: React.FC<InputLineProps> = ({ onSubmit, commandHistory, setCommandHistory }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const { theme } = useTheme();

  // This function reads from the DOM to calculate and imperatively set the cursor position.
  // It remains in the component as it's tightly coupled to the component's refs and DOM structure.
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

  const {
    value,
    inlineHint,
    handleChange,
    handleSubmit,
    handleKeyDown,
  } = useCommandInput({
    onSubmit,
    commandHistory,
    setCommandHistory,
    inputRef,
    updateCursorPosition
  });

  // Focus input on initial mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Update the visual cursor position whenever the input value changes.
  useEffect(() => {
    updateCursorPosition();
  }, [updateCursorPosition, value]);

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