# Declarative Output System

The Terminus framework now uses a declarative output system that separates the intent (what to output) from the implementation (how to render it). This makes commands cleaner and the rendering more centralized and themeable.

## Benefits

1. **Separation of Concerns**: Commands declare intent, Renderer handles presentation
2. **Centralized Theming**: All styling decisions made in one place
3. **Extensibility**: Easy to add new output types
4. **Consistency**: All commands follow the same output pattern
5. **Maintainability**: Easier to modify styling across the entire application

## Available Output Types

- `TEXT`: Simple text output
- `SUCCESS`: Success messages
- `ERROR`: Error messages
- `WARNING`: Warning messages
- `CODE`: Code blocks
- `LIST`: Ordered or unordered lists
- `TABLE`: Tabular data
- `JSON`: JSON data
- `MARKDOWN`: Markdown content
- `CUSTOM`: Custom React components

## Helper Functions

The framework provides helper functions to create output objects:

```typescript
// Simple text output
context.printLine("Hello, world!");

// Success message
context.printSuccess("Operation completed successfully");

// Error message
context.printError("Something went wrong");

// Warning message
context.printWarning("This is a warning");

// Code block
context.printCode("console.log('Hello, world!');");

// List
context.printList([
  { content: "Item 1" },
  { content: "Item 2", type: "success" },
  { content: "Item 3", type: "error" }
]);

// Table
context.printTable({
  headers: ["Name", "Age"],
  rows: [
    ["Alice", "25"],
    ["Bob", "30"]
  ]
});

// JSON
context.printJson({ name: "Alice", age: 25 });

// Markdown
context.printMarkdown("# Header\n\nThis is **bold** text.");

// Custom React component
context.printCustom(<div>Custom content</div>);
```

## Example Usage

### Before (Old API)
```typescript
return {
  success: true,
  output: <p className={context.theme.textPrimary}>Result: {formattedResult}</p>
};
```

### After (New API)
```typescript
return {
  success: true,
  output: context.printSuccess(`Result: ${formattedResult}`)
};
```

## Complex Example

```typescript
return {
  success: true,
  output: context.printList([
    { content: "Item 1", type: "success" },
    { content: "Item 2", type: "warning" },
    { content: "Item 3", type: "error" }
  ])
};
```