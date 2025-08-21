import { Command, CommandArg, CommandResult } from '../types';

export const themeCommand: Command = {
  name: 'theme',
  description: 'Lists available themes or changes the current theme',
  category: 'System',
  args: [
    {
      name: 'themeName',
      description: 'The name of the theme to switch to',
      required: false,
      type: 'string'
    }
  ] as CommandArg[],
  handler: (args, context): CommandResult => {
    const themeName = args._?.[0] as string;
    
    if (themeName) {
      const newTheme = context.setTheme(themeName);
      if (newTheme) {
        return { 
          success: true, 
          output: context.printSuccess(`Theme changed to '${themeName}'.`) 
        };
      } else {
        return { 
          success: false, 
          error: context.printError(`Theme '${themeName}' not found. Available themes: ${context.availableThemes.join(', ')}`) 
        };
      }
    } else {
      // List available themes
      const currentTheme = context.availableThemes.find(theme => 
        theme === context.theme.name
      ) || 'default';
      
      // Create list items for themes
      const themeItems = context.availableThemes.map(theme => ({
        content: theme === currentTheme ? `* ${theme} (current)` : `  ${theme}`,
        styleType: theme === currentTheme ? 'textSuccess' : 'textFaded'
      }));
      
      const header = { content: 'Available themes:', styleType: 'textSecondary' };
      
      return { 
        success: true, 
        output: context.printList([header, ...themeItems], { ordered: false })
      };
    }
  }
};
