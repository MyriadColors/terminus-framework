# Terminus Framework

Terminus is a React-based framework for building interactive terminal user interfaces (TUIs).

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [`<TerminalView />`](#terminalview--component)
  - [`useTerminal()`](#useterminal--hook)
- [Guides](#guides)
  - [Creating Commands](#creating-commands)
  - [Theming](#theming)
  - [Customization (Render Props)](#customization-render-props)

## Getting Started

To get started with Terminus, install the package and set up your `App.tsx`:

```bash
npm install terminus-framework
# or
yarn add terminus-framework
# or
bun add terminus-framework
```

```typescript
// App.tsx
import React from "react";
import {
  TerminalProvider,
  TerminalView,
  useTerminalStore,
  ThemeStyle,
} from "terminus-framework";
import { defaultCommands } from "./commands"; // Your command definitions

const WelcomeMessage = () => {
  const theme: ThemeStyle = useTerminalStore(
    (state) => state.themes[state.themeName] || state.themes.default
  );
  return (
    <div>
      <p className={theme.textPrimary}>Welcome to Terminus!</p>
      <p>This is a React-based framework for building interactive TUIs.</p>
      <p>
        Type <span className={theme.textSecondary}>'help'</span> to see a list
        of available commands.
      </p>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const theme: ThemeStyle = useTerminalStore(
    (state) => state.themes[state.themeName] || state.themes.default
  );

  return (
    <main
      className={`font-mono ${theme.appBg} ${theme.appText} min-h-screen transition-colors duration-300`}
    >
      <div className="container mx-auto p-4">
        <h1 className={`text-2xl md:text-4xl ${theme.header} font-bold mb-4`}>
          Terminus
        </h1>
        <p className={`${theme.textFaded} mb-6`}>
          A React-based framework for interactive terminal applications. Type
          'help' to see available commands.
        </p>
        <TerminalView />
      </div>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <TerminalProvider
      commands={defaultCommands}
      welcomeMessage={<WelcomeMessage />}
      initialTheme="default"
    >
      <AppLayout />
    </TerminalProvider>
  );
};

export default App;
```

## Core Concepts

Terminus operates on a Provider/Hook model:

- **`<TerminalProvider>`**: This component wraps your application and provides the terminal's state and actions to its children via React Context.
- **`useTerminal()`**: This hook allows any component within the `TerminalProvider`'s scope to interact with the terminal, such as printing output, running commands, or changing the theme.

## API Reference

### `<TerminalView />` Component

This component renders the main terminal interface.

**Props:**

- `renderPrompt?: (path: string) => React.ReactNode;`
  A render prop to customize the terminal prompt. Receives the current path as an argument.
- `renderHistoryItem?: (item: HistoryItem) => React.ReactNode;`
  A render prop to customize how each history item (command and its output) is displayed.

### `useTerminal()` Hook

Provides access to the terminal's state and actions.

**Return Value:**

```typescript
interface UseTerminalResult {
  state: {
    history: HistoryItem[];
    currentTheme: ThemeStyle;
    availableThemes: string[];
    currentPath: string;
    isBusy: boolean;
  };
  print: (output: React.ReactNode) => void;
  run: (command: string) => void;
  clear: () => void;
  setTheme: (themeNameOrObject: string | ThemeStyle) => void;
  registerCommand: (command: Command) => void;
  setCurrentPath: (path: string) => void;
}
```

## Guides

### Creating Commands

Commands are defined as objects conforming to the `Command` interface. They can be synchronous or asynchronous.

```typescript
// Example basic command
import React from "react";
import { Command, CommandContext, CommandResult } from "terminus-framework";

export const helloCommand: Command = {
  name: "hello",
  description: "Says hello",
  handler: (args, context): CommandResult => {
    return { success: true, output: <p>Hello, world!</p> };
  },
};

// Example async command
export const asyncCommand: Command = {
  name: "async",
  description: "Demonstrates asynchronous command handling",
  handler: async (args, context): Promise<CommandResult> => {
    context.print("Starting long running task...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, output: <p>Task completed!</p> };
  },
};

// Example command with arguments
export const greetCommand: Command = {
  name: "greet",
  description: "Greets a person",
  args: [
    { name: "name", description: "The name to greet", required: true },
    {
      name: "loud",
      description: "If true, greets loudly",
      type: "boolean",
      defaultValue: false,
    },
  ],
  handler: (args, context): CommandResult => {
    const greeting = args.loud
      ? `HELLO, ${args.name.toUpperCase()}!`
      : `Hello, ${args.name}!`;
    return { success: true, output: <p>{greeting}</p> };
  },
};
```

Register your commands with the `TerminalProvider`:

```typescript
import { TerminalProvider } from "terminus-framework";
import { helloCommand, asyncCommand, greetCommand } from "./commands";

const allCommands = [helloCommand, asyncCommand, greetCommand];

const App: React.FC = () => {
  return (
    <TerminalProvider commands={allCommands}>{/* ... */}</TerminalProvider>
  );
};
```

Or dynamically using `registerCommand` from `useTerminal`:

```typescript
import React, { useEffect } from "react";
import { useTerminal, Command } from "terminus-framework";

const MyComponent: React.FC = () => {
  const { registerCommand } = useTerminal();

  useEffect(() => {
    const dynamicCommand: Command = {
      name: "dynamic",
      description: "A dynamically registered command",
      handler: (args, context) => {
        return {
          success: true,
          output: <p>This command was registered at runtime!</p>,
        };
      },
    };
    registerCommand(dynamicCommand);
  }, [registerCommand]);

  return null;
};
```

### Theming

You can customize the terminal's appearance by providing `initialTheme` and `themes` props to `TerminalProvider`.

```typescript
import { TerminalProvider, ThemeStyle } from "terminus-framework";

const myCustomTheme: ThemeStyle = {
  name: "my-custom-theme",
  appBg: "bg-blue-900",
  appText: "text-blue-100",
  header: "text-yellow-400",
  terminalBg: "bg-blue-800",
  terminalBorder: "border-blue-600",
  terminalFocusRing: "focus:ring-yellow-500",
  terminalText: "text-blue-200",
  promptSymbol: "text-yellow-400",
  cursorBg: "bg-yellow-400",
  inlineHintText: "text-blue-500",
  textPrimary: "text-yellow-400",
  textSecondary: "text-orange-300",
  textTertiary: "text-cyan-400",
  textError: "text-red-500",
  textFaded: "text-blue-400",
};

const App: React.FC = () => {
  return (
    <TerminalProvider
      commands={[]}
      initialTheme="my-custom-theme"
      themes={{ "my-custom-theme": myCustomTheme }}
    >
      {/* ... */}
    </TerminalProvider>
  );
};
```

You can also change themes dynamically using `setTheme` from `useTerminal`:

```typescript
import React from "react";
import { useTerminal } from "terminus-framework";

const ThemeSwitcher: React.FC = () => {
  const { setTheme } = useTerminal();

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  return (
    <select onChange={handleThemeChange}>
      <option value="default">Default</option>
      <option value="light">Light</option>
      {/* Add your custom themes here */}
    </select>
  );
};
```

### Customization (Render Props)

Customize the appearance of the prompt and history items using `renderPrompt` and `renderHistoryItem` props on `<TerminalView />`.

```typescript
import React from "react";
import {
  TerminalView,
  HistoryItem,
  useTerminalStore,
  ThemeStyle,
} from "terminus-framework";

const CustomPrompt: React.FC<{ path: string }> = ({ path }) => {
  const theme: ThemeStyle = useTerminalStore(
    (state) => state.themes[state.themeName] || state.themes.default
  );
  return (
    <span className={`${theme.promptSymbol} mr-2`}>
      <span className="font-bold">{path}</span> &gt;
    </span>
  );
};

const CustomHistoryItem: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const theme: ThemeStyle = useTerminalStore(
    (state) => state.themes[state.themeName] || state.themes.default
  );
  const outputClassName = item.type === "error" ? theme.textError : "";

  return (
    <div>
      <div className="flex items-center">
        <span className={`${theme.promptSymbol} mr-2`}>&gt;</span>
        <span className="flex-1">{item.command}</span>
      </div>
      <div className={`leading-snug ${outputClassName}`}>{item.output}</div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TerminalView
      renderPrompt={(path) => <CustomPrompt path={path} />}
      renderHistoryItem={(item) => <CustomHistoryItem item={item} />}
    />
  );
};
```
