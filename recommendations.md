# Terminus Framework API: Recommendations for Improvement

This document provides a detailed analysis of the Terminus Framework's API and offers concrete recommendations and implementation strategies to enhance its flexibility, robustness, and ease of use.

---

## 1. Core API Surface Analysis

The framework's public API primarily consists of:

-   **Components:** `<TerminalProvider>`, `<TerminalView>`
-   **Hooks:** `useTerminal()`
-   **Systems:** Command Registry and Theming System
-   **Types:** Definitions in `types.ts`

The current architecture is a strong starting point. The following recommendations aim to build upon this foundation to create a more powerful and developer-friendly library.

---

## 2. Detailed Recommendations

### A. Flexibility

To allow developers to adapt the framework to a wider variety of scenarios, the following enhancements are recommended.

#### **1. Dynamic Command Registration**

-   **Problem:** Commands are statically registered, requiring developers to edit a central file (`commands/index.ts`) to add functionality. This is inflexible for building plugins or modular applications.
-   **Solution:** Expose a `registerCommand` function via the `useTerminal` hook. This allows any component to add commands at runtime.
-   **Implementation:**
    -   In `TerminalContext.tsx`, manage the commands as part of the state.
    -   Create a memoized `registerCommand` function that updates this state.

    ```typescript
    // In contexts/TerminalProvider.tsx
    import { useState, useCallback } from 'react';
    import { Command, CommandMap } from '../types'; // Assuming types are defined

    const [commands, setCommands] = useState<CommandMap>(initialCommands);

    const registerCommand = useCallback((command: Command) => {
        setCommands(prevCommands => ({
            ...prevCommands,
            [command.name.toLowerCase()]: command
        }));
    }, []);

    const contextValue = {
        // ... other values
        commands,
        registerCommand
    };
    ```

    -   The `useTerminal()` hook would then simply return this function from the context.

#### **2. Customizable Theming**

-   **Problem:** Themes are hardcoded in `styles/themes.ts`, preventing users from easily creating or modifying themes at runtime.
-   **Solution:** Allow a `theme` object to be passed as a prop to `<TerminalProvider>` and expose a `setTheme` function to switch themes or apply a custom theme dynamically.
-   **Implementation:**
    -   Modify `TerminalProvider` to accept `initialTheme` and `customThemes` props.
    -   The `ThemeContext` should expose the current theme object and a `setTheme` function.

    ```typescript
    // In contexts/ThemeContext.tsx
    const [activeTheme, setActiveTheme] = useState(initialTheme);

    const themeApi = {
        setTheme: (themeNameOrObject: string | object) => {
            if (typeof themeNameOrObject === 'string') {
                // Logic to find theme by name in pre-defined or custom themes
                const newTheme = { ...predefinedThemes, ...customThemes }[themeNameOrObject];
                if (newTheme) setActiveTheme(newTheme);
            } else {
                // Assume it's a theme object and merge it with a base
                setActiveTheme(baseTheme => ({ ...baseTheme, ...themeNameOrObject }));
            }
        },
        theme: activeTheme
    };
    ```

#### **3. Component Overrides (Render Props)**

-   **Problem:** The terminal's structure is rigid. A developer cannot easily replace the prompt, input, or history lines with custom components.
-   **Solution:** Use the "render props" pattern to allow developers to provide their own components to render parts of the terminal UI.
-   **Implementation:**
    -   Update the props for `<TerminalView>` to accept render functions.
    -   In the `TerminalView` component, conditionally use the prop or render the default.

    ```tsx
    // In components/TerminalView.tsx

    interface TerminalViewProps {
      // ...
      renderPrompt?: (path: string) => React.ReactNode;
      renderHistoryItem?: (item: HistoryItem) => React.ReactNode;
    }

    const TerminalView = ({ renderPrompt, renderHistoryItem, ... }: TerminalViewProps) => {
      // ...
      return (
        <div>
          {/* History Section */}
          {history.map(item =>
            renderHistoryItem ? renderHistoryItem(item) : <DefaultHistoryItem item={item} />
          )}

          {/* Input Line Section */}
          <div className="input-line">
            {renderPrompt ? renderPrompt(path) : <DefaultPrompt path={path} />}
            <InputLine />
          </div>
        </div>
      );
    };
    ```

### B. Robustness

To ensure the framework is reliable and handles edge cases gracefully.

#### **1. Asynchronous Command Handling**

-   **Problem:** The system may not explicitly handle `async` commands, potentially causing race conditions or unresponsive UI.
-   **Solution:** Make the command execution logic inherently asynchronous and provide visual feedback to the user.
-   **Implementation:**
    -   Introduce an `isBusy` state flag in the `TerminalContext`.
    -   The `executeCommand` function must be `async` and wrap the command execution in a `try...finally` block to ensure the `isBusy` flag is always reset.

    ```typescript
    // In TerminalProvider's command execution logic
    const [isBusy, setIsBusy] = useState(false);

    const executeCommand = async (commandText: string) => {
        setIsBusy(true);
        try {
            const { command, args } = parseCommand(commandText);
            if (command) {
                // The 'execute' function on a command should return a Promise<CommandResult>
                const result = await command.execute(args);
                // Add result to history
            } else {
                // Handle "command not found"
            }
        } catch (error) {
            // Handle unexpected errors from command execution
        } finally {
            setIsBusy(false);
        }
    };
    ```
    -   The `InputLine` component can use the `isBusy` flag to disable its input field.

#### **2. Structured Command Output & Error Handling**

-   **Problem:** Returning only strings from commands limits output to simple text and provides no formal way to distinguish between a successful result and an error.
-   **Solution:** Define a structured return type for commands and an expanded type for history items.
-   **Implementation:**
    -   Define these types in `types.ts`:

    ```typescript
    // In types.ts
    export type CommandResult = {
      success: true;
      output: React.ReactNode; // Allow string or rich components
    } | {
      success: false;
      error: React.ReactNode; // Allow string or rich components
    };

    export interface HistoryItem {
      id: number;
      command: string;
      output: React.ReactNode;
      type: 'standard' | 'error';
    }
    ```
    -   The `TerminalView` can then render items differently based on their `type`.

### C. Ease of Use (Developer Experience)

To make the framework intuitive and easy to adopt.

#### **1. Create a Clear API Entry Point**

-   **Problem:** Developers may need to import from multiple deep paths (`/contexts`, `/hooks`), which is verbose and exposes the internal file structure.
-   **Solution:** Create a single "barrel" file (`index.ts` or `terminus.ts`) at the root of the source folder to export all public APIs.
-   **Implementation:**

    ```typescript
    // In src/index.ts
    export { TerminalProvider } from './contexts/TerminalProvider';
    export { ThemeProvider } from './contexts/ThemeContext';
    export { TerminalView } from './components/TerminalView';
    export { useTerminal } from './hooks/useTerminal';
    export * from './types'; // Export all type definitions
    ```
    This allows developers to write: `import { TerminalProvider, useTerminal, Command } from 'terminus-framework';`

#### **2. Provide Comprehensive Documentation**

-   **Problem:** Without documentation, developers must read the source code to understand how to use the framework.
-   **Solution:** Create a detailed `README.md` or a dedicated documentation page.
-   **Implementation:** The documentation should include:
    -   **Getting Started:** A minimal setup guide.
    -   **Core Concepts:** Explanation of the Provider/Hook model.
    -   **API Reference:** Full details on props for `<TerminalView>` and the `useTerminal()` hook's return values.
    -   **Guides:**
        -   *Creating Commands:* Show basic, async, and argument-parsing commands.
        -   *Theming:* Provide the theme object's structure and explain how to add new themes.
        -   *Customization:* Show examples of using the `render...` props.

---

## Summary

The Terminus Framework has a strong architectural foundation. By implementing these recommendations, you can significantly improve its power and appeal to other developers. The key takeaways are:

1.  **Embrace Dynamic Configuration:** Move from static definitions to runtime APIs for commands and themes.
2.  **Enable Extensibility:** Use render props to allow developers to customize the UI.
3.  **Build for Robustness:** Implement explicit async handling and structured error states.
4.  **Prioritize Developer Experience:** A clean API entry point and thorough documentation are essential for adoption.
