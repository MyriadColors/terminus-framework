import { Command } from '../types';

export const themeCommand: Command = {
  name: 'theme',
  description: 'Lists available themes or sets the current theme.',
  aliases: ['style'],
  args: [
    {
      name: 'subcommand',
      description: "Either 'list' or 'set'. Defaults to 'list' if omitted.",
      required: false,
    },
    {
      name: 'theme_name',
      description: "The name of the theme to set. Required if subcommand is 'set'.",
      required: false,
    },
  ],
  handler: (args, context) => {
    const { theme, setTheme, availableThemes } = context;
    const originalSubCommand = args._?.[0];
    const themeName = args._?.[1];
    const subCommand = originalSubCommand || 'list';

    if (subCommand === 'list') {
      const themeItems = availableThemes.map(name => ({
        content: `${name}${theme.name === name ? ' (current)' : ''}`,
        styleType: theme.name === name ? 'textFaded' : 'textPrimary'
      }));
      
      return {
        success: true,
        output: context.printList(themeItems, { 
          ordered: false,
          itemStyleType: 'textPrimary'
        })
      };
    }
    
    if (subCommand === 'set') {
      if (!themeName) {
        return { 
          success: false, 
          error: context.printError("Error: Missing theme name. Usage: theme set <theme_name>") 
        };
      }
      
      const newTheme = setTheme(themeName);

      if (newTheme) {
        return { 
          success: true, 
          output: context.printSuccess(`Theme changed to '${themeName}'.`) 
        };
      } else {
        return { 
          success: false, 
          error: context.printError(`Error: Theme '${themeName}' not found. Use 'theme list' to see available themes.`) 
        };
      }
    }

    return { 
      success: false, 
      error: context.printError(`Invalid subcommand '${originalSubCommand}'. Use 'list' or 'set'.`) 
    };
  },
};
