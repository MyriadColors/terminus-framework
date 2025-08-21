
import { commandRegistry } from '../services/commandRegistry';
import { helpCommand } from './help';
import { clearCommand } from './clear';
import { echoCommand } from './echo';

commandRegistry.register(helpCommand);
commandRegistry.register(clearCommand);
commandRegistry.register(echoCommand);
