
import React from 'react';
import Terminal from './components/Terminal';
import './commands'; // Import for side-effect of registering commands

const App: React.FC = () => {
  return (
    <main className="font-mono bg-gray-900 text-gray-100 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl md:text-4xl text-green-400 font-bold mb-4">Terminus</h1>
        <p className="text-gray-400 mb-6">A React-based framework for interactive terminal applications. Type 'help' to see available commands.</p>
        <Terminal />
      </div>
    </main>
  );
};

export default App;
