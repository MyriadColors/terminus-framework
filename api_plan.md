# `Terminus` Library API Design Plan

Exposing a well-designed API is critical for turning a project into a successful library. The goal is to create a developer experience (DX) that is intuitive, flexible, and powerful, while hiding the internal complexity.

Here is a breakdown of a proposed API structure for `Terminus`, along with the necessary preparatory steps.

## I. Guiding Principles for the API

1.  **Declarative and Component-Based:** Developers should define *what* they want the terminal to do, not *how* it does it. The API should be built around React components and hooks, which is idiomatic for the ecosystem.
2.  **High Cohesion, Low Coupling:** The core terminal logic (state management, command parsing) should be separate from the UI rendering. This allows developers to potentially create their own UI components in the future if they wish.
3.  **Stable Public Interface:** The internal state management (Zustand) is an implementation detail. The public API should be a curated set of functions and properties that we can maintain without introducing breaking changes, even if we swap out the internal library later.
4.  **Extensibility:** Developers must be able to easily add their own commands, create custom themes, and interact with the terminal programmatically from anywhere in their application.

---

## II. Proposed Public API Surface

The library would export a few key pieces that work together:

### 1. `<TerminalProvider>` Component

This will be the root component that manages the entire state of the terminal. It won't render any UI itself but will provide the context for all other terminal components and hooks.

**Props:**

*   `commands: Command[]`: (Required) An array of command definition objects. This is the primary way developers add functionality.
*   `welcomeMessage?: React.ReactNode`: A message or component to display when the terminal first loads.
*   `themes?: Record<string, ThemeStyle>`: An object of custom themes to be merged with the defaults, allowing developers to extend or override the built-in styles.
*   `initialTheme?: string`: The name of the theme to use on startup.

**Example Usage:**

```jsx
import { TerminalProvider, TerminalView, myCommands, myThemes } from 'terminus-tui';

function MyApp() {
  return (
    <TerminalProvider 
      commands={myCommands} 
      themes={myThemes} 
      initialTheme="my-custom-theme"
      welcomeMessage={<p>Welcome to my custom app!</p>}
    >
      <MyApplicationLayout>
        {/* The terminal can be placed anywhere inside the provider */}
        <TerminalView />
      </MyApplicationLayout>
    </TerminalProvider>
  );
}
```

### 2. `<TerminalView>` Component

This is the visual component that renders the terminal interface (the history of commands and the input line). It would be a simple, "dumb" component that gets all its data and state from the context provided by `<TerminalProvider>`. It would likely take minimal or no props itself, promoting a clean separation of concerns.

### 3. `useTerminal()` Hook

This is the most powerful part of the API. It allows any component wrapped by `<TerminalProvider>` to interact with the terminal's state and actions programmatically.

**Return Value (an object with):**

*   `print: (output: React.ReactNode) => void`: Programmatically add content to the terminal output, independent of a user command. Useful for logging events, showing real-time data, etc.
*   `run: (command: string) => void`: Programmatically execute a command string as if the user had typed it.
*   `clear: () => void`: Clears all output from the terminal screen.
*   `setTheme: (themeName: string) => void`: Changes the current theme.
*   `state: { history: HistoryItem[], currentTheme: ThemeStyle, availableThemes: string[] }`: Read-only access to the terminal's state for building custom UI around it.

**Example Usage:**

```jsx
import { useTerminal } from 'terminus-tui';
import { useEffect } from 'react';

function RealtimeStatusIndicator() {
  const { print } = useTerminal();

  useEffect(() => {
    // Listen to some external event source
    const onStatusUpdate = (status) => {
      print(<p>System status updated: <span className="text-yellow-300">{status}</span></p>);
    };

    api.subscribe(onStatusUpdate);
    return () => api.unsubscribe(onStatusUpdate);
  }, [print]);

  return null; // This component renders no UI itself
}
```

### 4. Type Exports

To ensure a good TypeScript experience, we must export all necessary types for developers:
`Command`, `CommandArg`, `TerminalContext`, `HistoryItem`, `ThemeStyle`.

---

## III. Preparatory Steps (Refactoring Plan)

To achieve this API, the current codebase would need some restructuring:

1.  **Isolate State Management:** The logic inside `Terminal.tsx` that creates the Zustand store (`createTerminalStore`) should be moved into the new `<TerminalProvider>` component. This provider will be the single source of truth.
2.  **Create the Public Hook:** A new `useTerminal()` hook needs to be created. It will call the internal `useTerminalStore` hook but will expose a more stable and curated API (`print` instead of the internal `addHistoryItem`, for example). This abstraction layer is crucial for long-term maintenance.
3.  **Separate UI from Logic:**
    *   The current `<Terminal>` component will be split. Its state/context logic goes into `<TerminalProvider>`.
    *   Its rendering logic (the current `<TerminalDisplay>`) will become the new public `<TerminalView>` component.
4.  **Establish a Library Entry Point:** Create a main `index.ts` file at the root of the library source that explicitly exports *only* the public API: `<TerminalProvider>`, `<TerminalView>`, `useTerminal()`, and the public types. Internal components like `InputLine` or services like `commandParser` would not be exported, keeping the public surface clean and manageable.

By following this plan, we can transform the existing application into a robust, extensible, and developer-friendly library for building powerful TUI applications in React.
