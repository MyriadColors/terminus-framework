import React, { createContext, useContext, useState, useMemo } from 'react';

export interface ThemeStyle {
  name: string;
  // App
  appBg: string;
  appText: string;
  header: string;
  // Terminal
  terminalBg: string;
  terminalBorder: string;
  terminalFocusRing: string;
  terminalText: string;
  // Prompt & Input
  promptSymbol: string;
  cursorBg: string;
  inlineHintText: string;
  // Command outputs
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textError: string;
  textFaded: string;
}

export const defaultThemes: Record<string, ThemeStyle> = {
  default: {
    name: 'default',
    appBg: 'bg-gray-900',
    appText: 'text-gray-100',
    header: 'text-green-400',
    terminalBg: 'bg-gray-800',
    terminalBorder: 'border-gray-600',
    terminalFocusRing: 'focus:ring-green-500',
    terminalText: 'text-gray-200',
    promptSymbol: 'text-green-400',
    cursorBg: 'bg-green-400',
    inlineHintText: 'text-gray-500',
    textPrimary: 'text-green-400',
    textSecondary: 'text-yellow-300',
    textTertiary: 'text-cyan-400',
    textError: 'text-red-500',
    textFaded: 'text-gray-400',
  },
  light: {
    name: 'light',
    appBg: 'bg-gray-100',
    appText: 'text-gray-800',
    header: 'text-blue-600',
    terminalBg: 'bg-white',
    terminalBorder: 'border-gray-400',
    terminalFocusRing: 'focus:ring-blue-500',
    terminalText: 'text-gray-700',
    promptSymbol: 'text-blue-600',
    cursorBg: 'bg-blue-600',
    inlineHintText: 'text-gray-400',
    textPrimary: 'text-blue-600',
    textSecondary: 'text-purple-600',
    textTertiary: 'text-teal-600',
    textError: 'text-red-600',
    textFaded: 'text-gray-500',
  },
  solarized: {
    name: 'solarized',
    appBg: 'bg-[#002b36]',
    appText: 'text-[#93a1a1]',
    header: 'text-[#268bd2]',
    terminalBg: 'bg-[#073642]',
    terminalBorder: 'border-[#586e75]',
    terminalFocusRing: 'focus:ring-[#268bd2]',
    terminalText: 'text-[#93a1a1]',
    promptSymbol: 'text-[#268bd2]',
    cursorBg: 'bg-[#268bd2]',
    inlineHintText: 'text-[#586e75]',
    textPrimary: 'text-[#268bd2]',
    textSecondary: 'text-[#b58900]',
    textTertiary: 'text-[#2aa198]',
    textError: 'text-[#dc322f]',
    textFaded: 'text-[#839496]',
  },
  dracula: {
    name: 'dracula',
    appBg: 'bg-[#282a36]',
    appText: 'text-[#f8f8f2]',
    header: 'text-[#50fa7b]',
    terminalBg: 'bg-[#21222C]',
    terminalBorder: 'border-[#44475a]',
    terminalFocusRing: 'focus:ring-[#bd93f9]',
    terminalText: 'text-[#f8f8f2]',
    promptSymbol: 'text-[#50fa7b]',
    cursorBg: 'bg-[#f8f8f2]',
    inlineHintText: 'text-[#6272a4]',
    textPrimary: 'text-[#50fa7b]',
    textSecondary: 'text-[#ff79c6]',
    textTertiary: 'text-[#8be9fd]',
    textError: 'text-[#ff5555]',
    textFaded: 'text-[#bd93f9]',
  },
};

interface ThemeContextType {
  theme: ThemeStyle;
  setThemeName: (name: string) => void;
  themes: Record<string, ThemeStyle>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultThemes.default,
  setThemeName: () => {},
  themes: defaultThemes,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  themes?: Record<string, ThemeStyle>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, themes: customThemes }) => {
  const [themeName, setThemeName] = useState('default');
  const availableThemes = customThemes || defaultThemes;

  const value = useMemo(() => ({
    theme: availableThemes[themeName] || availableThemes.default,
    setThemeName,
    themes: availableThemes,
  }), [themeName, availableThemes]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};