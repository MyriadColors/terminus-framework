
import React, { useState, useCallback } from 'react';
import Terminal from './components/Terminal';
import { defaultCommands } from './commands';
import { useTerminalStore } from './contexts/TerminalContext';
import { ThemeStyle, defaultThemes } from './styles/themes';

const WelcomeMessage = () => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);
  return (
    <div>
      <p className={theme.textPrimary}>Welcome to Terminus!</p>
      <p>This is a React-based framework for building interactive TUIs.</p>
      <p>
        Type <span className={theme.textSecondary}>'help'</span> to see a list of available commands.
      </p>
    </div>
  );
};


const App: React.FC = () => {
  const [themeName, setThemeName] = useState('default');
  const theme: ThemeStyle = defaultThemes[themeName] || defaultThemes.default;

  const handleThemeChange = useCallback((newName: string) => {
    setThemeName(newName);
  }, []);

  return (
    <main className={`font-mono ${theme.appBg} ${theme.appText} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto p-4">
        <h1 className={`text-2xl md:text-4xl ${theme.header} font-bold mb-4`}>Terminus</h1>
        <p className={`${theme.textFaded} mb-6`}>A React-based framework for interactive terminal applications. Type 'help' to see available commands.</p>
        <Terminal 
          commands={defaultCommands} 
          welcomeMessage={<WelcomeMessage />} 
          themeName={themeName}
          onThemeChange={handleThemeChange}
        />
      </div>
    </main>
  );
};

export default App;