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
      return {
        success: true,
        output: (
          <div>
            <p className={theme.textSecondary}>Available Themes:</p>
            <ul className="list-disc list-inside">
              {availableThemes.map((name) => (
                <li key={name}>
                  <span className={theme.textPrimary}>{name}</span>
                  {theme.name === name && <span className={theme.textFaded}> (current)</span>}
                </li>
              ))}
            </ul>
          </div>
        ),
      };
    }
    
    if (subCommand === 'set') {
      if (!themeName) {
        return { success: false, error: <p className={theme.textError}>Error: Missing theme name. Usage: theme set &lt;theme_name&gt;</p> };
      }
      
      const newTheme = setTheme(themeName);

      if (newTheme) {
        return { success: true, output: <p>Theme changed to '<span className={newTheme.textPrimary}>{themeName}</span>'.</p> };
      } else {
        return { success: false, error: <p className={theme.textError}>Error: Theme '{themeName}' not found. Use 'theme list' to see available themes.</p> };
      }
    }

    return { success: false, error: <p className={theme.textError}>Invalid subcommand '{originalSubCommand}'. Use 'list' or 'set'.</p> };
  },
};
