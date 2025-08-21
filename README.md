# Terminus Framework

Terminus is a React-based framework for building interactive terminal user interfaces (TUIs). Unlike traditional terminal applications, Terminus allows you to create rich, web-based terminal experiences using familiar React patterns.

**Note**: Terminus Framework is currently intended to be used by cloning or forking this repository rather than as an npm package. In the future, we plan to make it available as a proper library that can be installed via npm.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Examples](#examples)
- [Contributing](#contributing)

## Features

- **React-based**: Build terminal interfaces using React components and hooks
- **Declarative Output System**: Clean separation between what to display and how to render it
- **Theming Support**: Easily customize the look and feel of your terminal
- **Command System**: Create simple or complex commands with argument parsing
- **Asynchronous Support**: Handle long-running operations without blocking the UI
- **Customizable Rendering**: Full control over prompt and history item rendering
- **TypeScript Support**: First-class TypeScript support with comprehensive type definitions

## Getting Started

To get started with Terminus Framework:

1. Clone or fork this repository:

   ```bash
   git clone https://github.com/your-username/terminus-framework.git
   cd terminus-framework
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. Open your browser to the URL provided in the terminal (typically http://localhost:5173)

## Project Structure

```
terminus-framework/
├── apps/                 # User applications and commands
│   ├── examples/         # Example applications (like calculator)
│   ├── [your-app]/       # Your custom applications
│   └── README.md         # Documentation for apps directory
├── commands/             # Core framework commands
├── components/           # React components
├── contexts/             # React contexts
├── docs/                 # Documentation
├── App.tsx               # Main application component
└── ...
```

### Adding Your Own Commands

1. Create a new directory in the `apps/` folder for your application:

   ```bash
   mkdir apps/my-app
   ```

2. Create your command files in your app directory:

   ```bash
   # apps/my-app/my-commands.tsx
   import { Command } from '../../types';

   export const myCommand: Command = {
     name: 'my-command',
     description: 'An example custom command',
     handler: (args, context) => {
       return {
         success: true,
         output: context.printLine('Hello from my custom command!')
       };
     }
   };
   ```

3. Import and register your commands in `App.tsx`:

   ```typescript
   import { myCommand } from "./apps/my-app/my-commands";

   const allCommands = [...defaultCommands, myCommand];

   // Then pass allCommands to TerminalProvider
   ```

## Documentation

To help you get the most out of Terminus, we've prepared several documentation resources:

- **[User Guide](./docs/UserGuide.md)** - Comprehensive guide covering everything from basic setup to advanced features
- **[Declarative Output Reference](./docs/declarative_output.md)** - Technical reference for the declarative output system
- **API Documentation** - Detailed information about components, hooks, and types (included in the User Guide)

## Examples

Check out the examples in the `apps/examples/` directory to see how to:

- Create commands with various argument types
- Use the declarative output system
- Implement custom themes
- Handle asynchronous operations

The `calculator.tsx` example demonstrates a complete calculator application with add, subtract, multiply, and divide commands.

## Contributing

We welcome contributions to Terminus! If you're interested in helping improve the framework, please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For bug reports or feature requests, please open an issue on the GitHub repository.

## License

MIT
