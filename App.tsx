import React from 'react';
import Terminal from './components/Terminal';
import { useTheme } from './contexts/ThemeContext';
import { defaultCommands } from './commands';

const WelcomeMessage = () => {
  const { theme } = useTheme();
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
  const { theme } = useTheme();

  return (
    <main className={`font-mono ${theme.appBg} ${theme.appText} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto p-4">
        <h1 className={`text-2xl md:text-4xl ${theme.header} font-bold mb-4`}>Terminus</h1>
        <p className={`${theme.textFaded} mb-6`}>A React-based framework for interactive terminal applications. Type 'help' to see available commands.</p>
        <Terminal commands={defaultCommands} welcomeMessage={<WelcomeMessage />} />
      </div>
    </main>
  );
};

export default App;