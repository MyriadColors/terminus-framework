# Terminus Framework User Guide

Welcome to the Terminus Framework User Guide! This guide is designed to help you get the most out of Terminus, whether you're just getting started or looking to leverage advanced features.

## Table of Contents

- [What is Terminus?](#what-is-terminus)
- [Getting Started](#getting-started)
- [Working with Commands](#working-with-commands)
- [Declarative Output System](#declarative-output-system)
- [Theming Your Terminal](#theming-your-terminal)
- [Customization Options](#customization-options)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## What is Terminus?

Terminus is a React-based framework for building interactive terminal user interfaces (TUIs). Unlike traditional terminal applications, Terminus allows you to create rich, web-based terminal experiences using familiar React patterns.

With Terminus, you can:
- Create interactive command-line interfaces in the browser
- Build terminal applications with rich theming capabilities
- Develop complex workflows with asynchronous operations
- Customize every aspect of your terminal's appearance and behavior

## Getting Started

To get started with Terminus, install the package and set up your `App.tsx`:

```bash
npm install terminus-framework
# or
yarn add terminus-framework
# or
bun add terminus-framework
```

Here's a minimal setup to get you started:

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

## Working with Commands

Commands are the core building blocks of any terminal application. In Terminus, commands are defined as objects with a name, description, and handler function.

### Basic Command Structure

```typescript
import { Command } from "terminus-framework";

export const helloCommand: Command = {
  name: "hello",
  description: "Says hello",
  handler: (args, context) => {
    return { success: true, output: context.printLine("Hello, world!") };
  },
};
```

### Commands with Arguments

You can define commands that accept arguments:

```typescript
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
  handler: (args, context) => {
    const greeting = args.loud
      ? `HELLO, ${args.name.toUpperCase()}!`
      : `Hello, ${args.name}!`;
    return { success: true, output: context.printLine(greeting) };
  },
};
```

### Asynchronous Commands

Commands can also be asynchronous, which is useful for operations that take time:

```typescript
export const asyncCommand: Command = {
  name: "async",
  description: "Demonstrates asynchronous command handling",
  handler: async (args, context) => {
    context.print("Starting long running task...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, output: context.printSuccess("Task completed!") };
  },
};
```

### Registering Commands

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

## Declarative Output System

Terminus uses a declarative output system that separates what you want to display from how it should be rendered. This approach makes your commands cleaner and ensures consistent, themeable output across your entire application.

### Why Use the Declarative Approach?

1. **Cleaner Commands**: Your command logic focuses on what to output, not how to style it
2. **Consistent Theming**: All output automatically follows your theme
3. **Easy Customization**: Change the look of all output in one place
4. **Better Maintainability**: Updates to styling don't require changing every command

### Available Output Types

Terminus provides helper functions for common output types:

| Function           | Purpose                 | Example                                               |
| ------------------ | ----------------------- | ----------------------------------------------------- |
| `printLine()`      | Simple text             | `context.printLine("Hello!")`                         |
| `printSuccess()`   | Success messages        | `context.printSuccess("Operation completed")`         |
| `printError()`     | Error messages          | `context.printError("Something went wrong")`          |
| `printWarning()`   | Warning messages        | `context.printWarning("Check your input")`            |
| `printCode()`      | Code blocks             | `context.printCode("npm install terminus-framework")` |
| `printList()`      | Ordered/unordered lists | `context.printList(items)`                            |
| `printTable()`     | Tabular data            | `context.printTable({ headers, rows })`               |
| `printJson()`      | JSON data               | `context.printJson(dataObject)`                       |
| `printMultiLine()` | Multiple styled lines   | `context.printMultiLine(lines)`                       |
| `printMarkdown()`  | Markdown content        | `context.printMarkdown("# Header")`                   |
| `printCustom()`    | Custom React elements   | `context.printCustom(<MyComponent />)`                |

### Basic Usage Examples

#### Simple Text Output

```typescript
export const helloCommand: Command = {
  name: "hello",
  description: "Says hello",
  handler: (args, context) => {
    return {
      success: true,
      output: context.printLine("Hello, world!"),
    };
  },
};
```

#### Success and Error Messages

```typescript
export const operationCommand: Command = {
  name: "operation",
  description: "Performs an operation",
  handler: (args, context) => {
    // Success case
    if (operationSucceeds()) {
      return {
        success: true,
        output: context.printSuccess("Operation completed successfully!"),
      };
    }

    // Error case
    return {
      success: false,
      error: context.printError("Operation failed. Please try again."),
    };
  },
};
```

### Advanced Usage

#### Styling Output

You can customize the appearance of your output using configuration objects:

```typescript
handler: (args, context) => {
  return {
    success: true,
    output: context.printLine("This text has custom styling", {
      styleType: "textSecondary", // Uses theme-provided styles
      className: "font-bold", // Adds custom CSS classes
    }),
  };
};
```

#### Creating Lists

Lists can contain simple items or complex items with multiple styled parts:

```typescript
handler: (args, context) => {
  // Simple list
  const simpleItems = ["First item", "Second item", "Third item"];

  // Complex list with styled parts
  const complexItems = [
    {
      content: "", // Will be rendered via parts
      parts: [
        { text: "Command: ", styleType: "textSecondary" },
        { text: "help", styleType: "textPrimary" },
      ],
    },
  ];

  return {
    success: true,
    output: context.printList([
      ...simpleItems.map((content) => ({ content })),
      ...complexItems,
    ]),
  };
};
```

#### Displaying Tabular Data

Tables are defined with headers and rows:

```typescript
handler: (args, context) => {
  const tableData = {
    headers: ["Name", "Role", "Department"],
    rows: [
      ["John Doe", "Developer", "Engineering"],
      ["Jane Smith", "Designer", "Product"],
    ],
  };

  return {
    success: true,
    output: context.printTable(tableData),
  };
};
```

### Working with Themes

All output automatically uses your current theme. The `styleType` property in configuration objects maps to your theme's CSS classes:

```typescript
// In your theme
const myTheme = {
  textPrimary: "text-blue-100",
  textSecondary: "text-blue-300",
  textSuccess: "text-green-400",
  textError: "text-red-500",
  // ... other theme properties
};

// In your command
context.printLine("This will be styled with text-blue-100", {
  styleType: "textPrimary",
});
```

## Theming Your Terminal

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
      {/* ... */
      }
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
      {/* Add your custom themes here */
      }
    </select>
  );
};
```

## Customization Options

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

## Best Practices

1. **Use the Declarative Output System**: It makes your code more maintainable and themeable
2. **Provide Clear Command Descriptions**: Help users understand what each command does
3. **Handle Errors Gracefully**: Always provide meaningful error messages
4. **Use Asynchronous Operations When Needed**: Don't block the UI during long operations
5. **Test Your Commands**: Make sure your commands work as expected in different scenarios
6. **Document Your Custom Commands**: If you're building a complex application, document your custom commands

## Troubleshooting

### Common Issues

1. **Commands Not Appearing**: Make sure you've registered your commands with the `TerminalProvider`
2. **Styling Issues**: Check that your theme is properly configured and that you're using the correct style types
3. **Async Operations Not Working**: Ensure you're properly handling promises in your command handlers

### Getting Help

If you're having trouble with Terminus, check out:
- The technical reference documentation in `declarative_output.md`
- The examples in the README
- The source code for built-in commands

For bug reports or feature requests, please open an issue on the GitHub repository.