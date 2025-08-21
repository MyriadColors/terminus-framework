import { commandRegistry } from './commandRegistry';

/**
 * Provides autocomplete suggestions based on the current input string.
 * @param currentInput The full string from the input line.
 * @returns An array of suggestion strings.
 */
export const getSuggestions = (currentInput: string): string[] => {
  const value = currentInput.trimStart();
  const parts = value.split(/\s+/);
  
  // If input is empty or just spaces, no suggestions.
  if (value === '' || (parts.length === 1 && parts[0] === '')) {
      return [];
  }

  // Scenario 1: Completing the command name (the first word).
  // This is true if there's only one part and the input doesn't end with a space,
  // meaning the user is still typing the command itself.
  const isTypingCommand = parts.length === 1 && !value.endsWith(' ');
  if (isTypingCommand) {
    const commandPart = parts[0];
    const allCommands = commandRegistry.getAll();
    return allCommands
      .filter(cmd => cmd.name.startsWith(commandPart))
      .map(cmd => cmd.name)
      .sort();
  }

  // Scenario 2: Completing an argument/flag.
  // The user has typed a command and a space, and is now typing another word.
  const commandName = parts[0];
  const command = commandRegistry.get(commandName);
  
  // If the command doesn't exist or has no defined args, no suggestions.
  if (!command || !command.args) {
    return [];
  }
  
  const lastPart = parts[parts.length - 1];

  // Only suggest if the user is typing a flag.
  if (lastPart.startsWith('-')) {
    return command.args
      .flatMap(arg => {
        const argSuggestions: string[] = [];
        if (`--${arg.name}`.startsWith(lastPart)) {
          argSuggestions.push(`--${arg.name}`);
        }
        if (arg.alias && `-${arg.alias}`.startsWith(lastPart)) {
          argSuggestions.push(`-${arg.alias}`);
        }
        return argSuggestions;
      })
      .sort();
  }

  return [];
};
