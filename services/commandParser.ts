
export const parseCommand = (input: string): { commandName: string; args: Record<string, string> } => {
  const parts = input.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  if (parts.length === 0) {
    return { commandName: '', args: {} };
  }

  const commandName = (parts[0] || '').toLowerCase();
  const rawArgs = parts.slice(1);
  
  // A simple positional argument parser for now.
  // A more robust implementation would handle named flags like --verbose.
  const args = rawArgs.reduce((acc, arg, index) => {
    // Remove quotes from arguments
    const cleanedArg = arg.startsWith('"') && arg.endsWith('"') ? arg.slice(1, -1) : arg;
    acc[index] = cleanedArg;
    return acc;
  }, {} as Record<string, string>);

  return { commandName, args };
};
