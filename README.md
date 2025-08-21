# Terminus Framework

A React-based framework for building interactive Terminal User Interfaces (TUIs). Terminus provides a modern, component-based approach to creating terminal applications with React, TypeScript, and a pluggable command system.

## 🚀 Features

- **React-powered TUIs**: Build terminal interfaces using familiar React components
- **Pluggable Command System**: Easy to extend with custom commands
- **Themeable Interface**: Multiple themes with CSS-in-JS styling
- **TypeScript Support**: Full type safety and IntelliSense
- **State Management**: Built-in Zustand store for terminal state
- **Command History**: Navigate through previous commands
- **Auto-completion**: Built-in command and argument suggestions
- **Modern Development**: Vite-based build system for fast development

## 📦 Installation

### Option 1: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/MyriadColors/terminus-framework.git
cd terminus-framework

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Use as a Library

```bash
# Install as a dependency in your project
npm install terminus-framework
```

## 🏗️ Architecture

Terminus is built with a modular architecture:

```
terminus-framework/
├── components/          # React components
│   ├── TerminalView.tsx # Main terminal interface
│   └── InputLine.tsx    # Command input component
├── contexts/            # React context providers
│   ├── TerminalProvider.tsx
│   └── ThemeContext.tsx
├── commands/            # Built-in commands
│   ├── help.tsx
│   ├── clear.tsx
│   ├── echo.tsx
│   └── theme.tsx
├── services/            # Business logic
│   ├── commandRegistry.ts
│   ├── commandParser.ts
│   └── autocompleteService.ts
├── store/               # State management
│   └── terminalStore.ts
├── styles/              # Theme definitions
│   └── themes.ts
└── types.ts              # TypeScript definitions
```

### Core Concepts

- **Commands**: Executable functions that users can run in the terminal
- **Context**: Information and APIs available to commands during execution
- **Themes**: Styling configurations for customizing the terminal appearance
- **Store**: Zustand-based state management for terminal state

## 🛠️ Quick Start

### Basic Usage

```tsx
import React from 'react';
import { TerminalProvider, TerminalView, Command } from 'terminus-framework';
import { helpCommand, clearCommand } from 'terminus-framework/commands';

const customCommand: Command = {
  name: 'greet',
  description: 'Greet someone',
  args: [
    {
      name: 'name',
      description: 'Name to greet',
      required: true,
      type: 'string'
    }
  ],
  handler: (args, context) => {
    return React.createElement('p', null, `Hello, ${args.name}!`);
  }
};

const MyApp: React.FC = () => {
  return (
    <TerminalProvider
      commands={[helpCommand, clearCommand, customCommand]}
      welcomeMessage={<div>Welcome to my custom terminal!</div>}
      initialTheme="default"
    >
      <div className="min-h-screen bg-gray-900 text-green-400 p-4">
        <h1 className="text-2xl mb-4">My Custom Terminal</h1>
        <TerminalView />
      </div>
    </TerminalProvider>
  );
};

export default MyApp;
```

## 🎨 Theming

Terminus supports multiple themes out of the box. You can also create custom themes:

```tsx
import { ThemeStyle } from 'terminus-framework';

const customTheme: ThemeStyle = {
  appBg: 'bg-purple-900',
  appText: 'text-purple-100',
  header: 'text-purple-200',
  textPrimary: 'text-purple-100',
  textSecondary: 'text-purple-300',
  textFaded: 'text-purple-400',
  textError: 'text-red-400',
  inputBg: 'bg-purple-800',
  inputText: 'text-purple-100',
  inputBorder: 'border-purple-600',
  buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
  buttonSecondary: 'bg-purple-700 hover:bg-purple-800 text-purple-100',
};

const MyApp: React.FC = () => {
  return (
    <TerminalProvider
      commands={defaultCommands}
      customThemes={{ myTheme: customTheme }}
      initialTheme="myTheme"
    >
      <TerminalView />
    </TerminalProvider>
  );
};
```

## ⚡ Creating Custom Commands

Commands are the core building blocks of Terminus applications. Each command has:

- A name and description
- Optional arguments with types and validation
- A handler function that processes the command and returns React elements

### Simple Command

```tsx
import { Command } from 'terminus-framework';

export const helloCommand: Command = {
  name: 'hello',
  description: 'Print a hello message',
  handler: (args, context) => {
    return React.createElement('p', null, 'Hello, World!');
  }
};
```

### Command with Arguments

```tsx
export const echoCommand: Command = {
  name: 'echo',
  description: 'Echo back the provided text',
  args: [
    {
      name: 'text',
      description: 'Text to echo',
      required: true,
      type: 'string'
    },
    {
      name: 'count',
      description: 'Number of times to echo',
      type: 'number',
      defaultValue: 1
    }
  ],
  handler: (args, context) => {
    const { text, count } = args;
    const elements = [];

    for (let i = 0; i < count; i++) {
      elements.push(React.createElement('p', { key: i }, text));
    }

    return React.createElement('div', null, ...elements);
  }
};
```

### Command with Context API

```tsx
export const themeCommand: Command = {
  name: 'theme',
  description: 'Switch terminal theme',
  args: [
    {
      name: 'name',
      description: 'Theme name to switch to',
      type: 'string'
    }
  ],
  handler: (args, context) => {
    if (args.name) {
      const newTheme = context.setTheme(args.name);
      if (newTheme) {
        return React.createElement('p', null, `Switched to theme: ${args.name}`);
      } else {
        return React.createElement('p', { className: context.theme.textError },
          `Theme '${args.name}' not found. Available themes: ${context.availableThemes.join(', ')}`);
      }
    } else {
      return React.createElement('div', null,
        React.createElement('p', null, `Current theme: ${context.theme}`),
        React.createElement('p', null, `Available themes: ${context.availableThemes.join(', ')}`)
      );
    }
  }
};
```

## 🔧 Built-in Commands

Terminus comes with several built-in commands:

- `help` - Display available commands and their descriptions
- `clear` - Clear the terminal history
- `echo` - Echo back provided text
- `theme` - Switch between available themes

## 🎯 Advanced Usage

### Using the Context API

Commands have access to a rich context object that provides:

- `clear()` - Clear terminal history
- `theme` - Current theme object
- `setTheme(name)` - Switch to a different theme
- `availableThemes` - Array of available theme names
- `getAllCommands()` - Get all registered commands
- `getCommand(name)` - Get a specific command by name

### Custom Command Registry

```tsx
import { CommandRegistry } from 'terminus-framework/services/commandRegistry';

const registry = new CommandRegistry();
registry.register(myCustomCommand);
registry.register(anotherCommand);

// Use with TerminalProvider
<TerminalProvider registry={registry} />
```

### Input Handling

The framework provides hooks for advanced input handling:

```tsx
import { useCommandInput } from 'terminus-framework/hooks/useCommandInput';

const MyTerminalComponent: React.FC = () => {
  const { inputValue, setInputValue, handleKeyDown } = useCommandInput();

  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="terminal-input"
    />
  );
};
```

## 🚀 Development

### Project Structure for Custom Applications

When building applications on top of Terminus, consider this structure:

```
my-terminal-app/
├── src/
│   ├── commands/        # Your custom commands
│   │   ├── user.tsx
│   │   ├── system.tsx
│   │   └── utils.tsx
│   ├── themes/          # Custom themes
│   │   └── customTheme.ts
│   ├── components/      # Additional UI components
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── package.json
└── vite.config.ts
```

### Building and Deployment

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and TypeScript
- State management powered by Zustand
- Development tooling by Vite
- Inspired by modern terminal applications
