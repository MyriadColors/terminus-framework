# Examples

This directory contains example applications that demonstrate how to use Terminus Framework.

## Calculator Example

The `calculator.tsx` file contains a complete calculator application with the following commands:

- `add` or `+` - Adds multiple numbers together
- `sub` or `-` - Subtracts multiple numbers from the first number
- `mul` or `*` - Multiplies multiple numbers together
- `div` or `/` - Divides the first number by subsequent numbers

### Using the Calculator Example

To use the calculator example in your application:

1. Copy the `calculator.tsx` file to your own app directory:

   ```bash
   cp calculator.tsx ../../apps/my-app/
   ```

2. Import the commands in your `App.tsx`:

   ```typescript
   import {
     addCommand,
     subtractCommand,
     multiplyCommand,
     divideCommand,
   } from "./apps/my-app/calculator";
   ```

3. Add the commands to your commands array:

   ```typescript
   const allCommands = [
     ...defaultCommands,
     addCommand,
     subtractCommand,
     multiplyCommand,
     divideCommand,
   ];
   ```

4. Pass the commands to the `TerminalProvider`:
   ```typescript
   <TerminalProvider
     commands={allCommands}
     welcomeMessage={<WelcomeMessage />}
     initialTheme="default"
   >
     <AppLayout />
   </TerminalProvider>
   ```

### Calculator Usage

Once registered, you can use the calculator commands in the terminal:

```
> add 5 3 2
Result: 10.00

> sub 10 3 2
Result: 5.00

> mul 5 3 2
Result: 30.00

> div 10 2 5
Result: 1.00
```
