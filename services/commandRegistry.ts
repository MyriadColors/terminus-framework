import { Command } from '../types';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  public register(command: Command): void {
    this.commands.set(command.name, command);
    if (command.aliases) {
      command.aliases.forEach(alias => this.commands.set(alias, command));
    }
  }

  public get(commandName: string): Command | undefined {
    return this.commands.get(commandName);
  }

  public getAll(): Command[] {
    // Use a map to get unique command objects based on their 'name' property
    const uniqueCommands = new Map<string, Command>();
    this.commands.forEach(cmd => {
        uniqueCommands.set(cmd.name, cmd);
    });
    return Array.from(uniqueCommands.values());
  }
  
  public clear(): void {
    this.commands.clear();
  }
}
