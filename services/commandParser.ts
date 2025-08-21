import { CommandArg } from '../types';

interface ParsedArgs {
  _: string[];
  [key: string]: any;
}

export const parseCommand = (input: string, commandArgsDef: CommandArg[] = []): ParsedArgs => {
  // This regex handles quoted strings as single arguments
  const parts = input.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  if (parts.length === 0) {
    return { _: [] };
  }

  const rawArgs = parts.slice(1);
  const args: ParsedArgs = { _: [] };
  
  // Create a quick lookup map for arg definitions by name and alias.
  const argDefs = new Map<string, CommandArg>();
  (commandArgsDef || []).forEach(argDef => {
    argDefs.set(argDef.name, argDef);
    if (argDef.alias) {
      argDefs.set(argDef.alias, argDef);
    }
  });

  const cleanQuotes = (s: string) => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;

  let i = 0;
  while (i < rawArgs.length) {
    const current = rawArgs[i];

    // Stop parsing flags after --
    if (current === '--') {
      const remainingArgs = rawArgs.slice(i + 1).map(cleanQuotes);
      args._.push(...remainingArgs);
      break;
    }

    if (current.startsWith('--')) {
      const flagPart = current.slice(2);
      const eqIndex = flagPart.indexOf('=');
      
      if (eqIndex !== -1) {
        // --key=value
        const key = flagPart.slice(0, eqIndex);
        const value = flagPart.slice(eqIndex + 1);
        args[key] = cleanQuotes(value);
        i++;
      } else {
        const key = flagPart;
        const next = rawArgs[i + 1];
        const keyDef = argDefs.get(key);
        const consumesValue = keyDef && keyDef.type !== 'boolean';

        if (consumesValue && next && !next.startsWith('-')) {
          // --key value
          args[key] = cleanQuotes(next);
          i += 2;
        } else {
          // --key (boolean flag)
          args[key] = true;
          i++;
        }
      }
    } else if (current.startsWith('-')) {
      const key = current.slice(1);
      const next = rawArgs[i + 1];

      // Don't treat numbers like -1 as flags
      if (!isNaN(Number(key))) {
        args._.push(cleanQuotes(current));
        i++;
        continue;
      }
      
      const keyDef = argDefs.get(key);
      const consumesValue = keyDef && keyDef.type !== 'boolean';

      if (consumesValue && next && !next.startsWith('-')) {
        // -k value
        args[key] = cleanQuotes(next);
        i += 2;
      } else {
        // -k (boolean flag)
        args[key] = true;
        i++;
      }
    } else {
      // Positional argument
      args._.push(cleanQuotes(current));
      i++;
    }
  }
  
  // Resolve aliases so the handler only needs to check for the primary name
  (commandArgsDef || []).forEach(argDef => {
      if (argDef.alias && args[argDef.alias] !== undefined) {
          args[argDef.name] = args[argDef.alias];
      }
  });

  return args;
};