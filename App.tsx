
import React from 'react';
import { TerminalView } from './index';
import { TerminalProvider } from './index';
import { defaultCommands } from './commands';
import { useTerminalStore } from './index';
import { ThemeStyle } from './index';

// You can add your own commands here by importing them from your own file.
// Uncomment the line below to include calculator commands as an example. 
// import { calculatorCommands } from './apps/examples/calculator';

// Combine all the commands into a single array for easier access and usage.
const allCommands = [
  ...defaultCommands,
  //...calculatorCommands, // Uncomment this line to include calculator commands as an example.
  // Add your own commands here...
]

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

// This new component demonstrates how a consumer of the library can
// use the provided context to theme their own application components.
const AppLayout: React.FC = () => {
  const theme: ThemeStyle = useTerminalStore((state) => state.themes[state.themeName] || state.themes.default);

  return (
    <main className={`font-mono ${theme.appBg} ${theme.appText} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto p-4">
        <h1 className={`text-2xl md:text-4xl ${theme.header} font-bold mb-4`}>Terminus</h1>
        <p className={`${theme.textFaded} mb-6`}>A React-based framework for interactive terminal applications. Type 'help' to see available commands.</p>
        <TerminalView />
      </div>
    </main>
  );
};


const App: React.FC = () => {
  return (
    <TerminalProvider 
      commands={allCommands} 
      welcomeMessage={<WelcomeMessage />} 
      initialTheme="default"
    >
      <AppLayout />
    </TerminalProvider>
  );
};

export default App;