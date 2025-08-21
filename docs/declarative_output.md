# Declarative Output System

## Overview

The Terminus framework now uses a declarative output system that separates the intent of what to output from how to render it. This approach makes commands cleaner and the rendering more centralized and themeable.

## Core Concepts

### Output Types

The system supports multiple output types, each with specific content and configuration options:

1. **TEXT** - Simple text output
2. **SUCCESS** - Success messages
3. **ERROR** - Error messages
4. **WARNING** - Warning messages
5. **CODE** - Code blocks
6. **LIST** - Lists (ordered or unordered)
7. **TABLE** - Tables with headers and rows
8. **JSON** - JSON data with formatting
9. **MARKDOWN** - Markdown content
10. **CUSTOM** - Custom React nodes
11. **MULTI_LINE** - Multiple lines with individual styling

### Helper Functions

Commands use helper functions provided in the `CommandContext` to create output objects:

- `printLine(content, config?)` - Simple text output
- `printMultiLine(lines, config?)` - Multiple lines with individual styling
- `printSuccess(content, config?)` - Success messages
- `printError(content, config?)` - Error messages
- `printWarning(content, config?)` - Warning messages
- `printCode(content, config?)` - Code blocks
- `printList(items, config?)` - Lists (ordered or unordered)
- `printTable(data, config?)` - Tables with headers and rows
- `printJson(data, config?)` - JSON data with formatting
- `printMarkdown(content, config?)` - Markdown content
- `printCustom(content, config?)` - Custom React nodes

## Implementation Details

### Output Interface

The core `Output` interface defines the structure of all output objects:

```typescript
interface Output {
  type: OutputType;
  content: OutputContent;
  config?: OutputConfig;
}
```

### Type-Specific Content and Configuration

Each output type has specific content and configuration requirements:

#### TEXT, SUCCESS, ERROR, WARNING, CODE, MARKDOWN

- `content`: `string`
- `config`: `{ styleType?: string; className?: string; }`

#### MULTI_LINE

- `content`: `{ lines: Array<{ text: string; styleType?: string; className?: string; }> }`
- `config`: `{ className?: string; }`

#### LIST

- `content`: `Array<{ content: string; type?: 'success' | 'warning' | 'error' | 'default'; styleType?: string; className?: string; parts?: Array<{ text: string; styleType?: string; className?: string; }> }>`
- `config`: `{ ordered?: boolean; itemStyleType?: string; itemClassName?: string; className?: string; }`

#### TABLE

- `content`: `{ headers: string[]; rows: string[][]; }`
- `config`: `{ headerStyleType?: string; rowStyleType?: string; cellStyleType?: string; className?: string; }`

#### JSON

- `content`: `any` (The raw data to be JSON stringified)
- `config`: `{ pretty?: boolean; indentSize?: number; className?: string; }`

#### CUSTOM

- `content`: `{ content: React.ReactNode; }`
- `config`: `{ className?: string; }`

## Usage Examples

### Simple Text Output

```typescript
// In a command handler
handler: (args, context) => {
  return {
    success: true,
    output: context.printLine("Hello, world!"),
  };
};
```

### Styled Output

```typescript
// Using styleType to apply theme classes
handler: (args, context) => {
  return {
    success: true,
    output: context.printSuccess("Operation completed!", {
      styleType: "textSecondary",
      className: "font-bold",
    }),
  };
};
```

### Multi-line Output

```typescript
// Multiple lines with different styling
handler: (args, context) => {
  return {
    success: true,
    output: context.printMultiLine([
      { text: "First line", styleType: "textPrimary" },
      { text: "Second line", styleType: "textSecondary" },
      { text: "Third line", styleType: "textError" },
    ]),
  };
};
```

### Lists

```typescript
// Creating a list with different item types
handler: (args, context) => {
  const items = [
    { content: "Success item", type: "success" },
    { content: "Warning item", type: "warning" },
    { content: "Error item", type: "error" },
    { content: "Plain item" },
  ];

  return {
    success: true,
    output: context.printList(items, { ordered: false }),
  };
};
```

### Tables

```typescript
// Creating a table with headers and rows
handler: (args, context) => {
  const tableData = {
    headers: ["Name", "Age", "City"],
    rows: [
      ["John Doe", "30", "New York"],
      ["Jane Smith", "25", "Los Angeles"],
    ],
  };

  return {
    success: true,
    output: context.printTable(tableData),
  };
};
```

### JSON

```typescript
// Displaying formatted JSON
handler: (args, context) => {
  const data = {
    name: "John Doe",
    age: 30,
    city: "New York",
  };

  return {
    success: true,
    output: context.printJson(data, { pretty: true, indentSize: 2 }),
  };
};
```

### Complex List Items

```typescript
// List items with multiple styled parts
handler: (args, context) => {
  const items = [
    {
      content: "", // Will be rendered via parts
      parts: [
        { text: "Command: ", styleType: "textSecondary" },
        { text: "help", styleType: "textPrimary" },
      ],
    },
    {
      content: "", // Will be rendered via parts
      parts: [
        { text: "Description: ", styleType: "textSecondary" },
        { text: "Displays help information", styleType: "textFaded" },
      ],
    },
  ];

  return {
    success: true,
    output: context.printList(items),
  };
};
```

## Benefits

### 1. Separation of Concerns

- Commands declare intent (what to output)
- Renderer handles presentation (how to output)
- Clear separation between business logic and presentation logic

### 2. Centralized Theming

- All styling decisions made in one place
- Consistent application of themes across all commands
- Easier to modify and extend styling

### 3. Extensibility

- Easy to add new output types
- Custom renderers for specific needs
- Plugin architecture for output formatting

### 4. Consistency

- All commands follow the same output pattern
- Standardized error and success messages
- Consistent user experience

### 5. Maintainability

- Easier to modify styling across the entire application
- Clear structure makes debugging easier
- Reduced code duplication in commands

## Migration from Legacy API

The declarative output system is backward compatible with the legacy API. Commands can still return React nodes directly, but new commands should use the declarative API for better maintainability and theming.

### Before (Legacy)

```typescript
return {
  success: true,
  output: <p className={context.theme.textPrimary}>Hello, world!</p>,
};
```

### After (Declarative)

```typescript
return {
  success: true,
  output: context.printLine("Hello, world!"),
};
```
