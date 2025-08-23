// This is the example calculator app

import { Command, CommandResult } from "@/types";

// Helper function to validate and parse numbers
const validateAndParseNumbers = (args: string[]): number[] => {
  const numbers: number[] = [];
  
  for (const arg of args) {
    const parsed = parseFloat(arg);
    if (isNaN(parsed)) {
      throw new Error(`All operands must be valid numbers (e.g., 5, 3.14, -2.5). Invalid input: '${arg}'`);
    }
    numbers.push(parsed);
  }
  
  return numbers;
};

// Helper function to format result to 2 decimal places
const formatResult = (result: number): number => {
  return Number(result.toFixed(2));
};

export const addCommand: Command = {
  name: 'add',
  aliases: ['+'],
  description: 'Adds multiple numbers together (prefix notation)',
  category: 'Calculator',
  handler: (args, context): CommandResult => {
    const operands = args._;
    
    if (operands.length < 2) {
      return {
        success: false,
        error: context.printError("Error: At least 2 operands required")
      };
    }
    
    try {
      const numbers = validateAndParseNumbers(operands);
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const formattedResult = formatResult(sum);
      
      return {
        success: true,
        output: context.printSuccess(`Result: ${formattedResult}`)
      };
    } catch (error) {
      return {
        success: false,
        error: context.printError((error as Error).message)
      };
    }
  }
};

export const subtractCommand: Command = {
  name: 'sub',
  aliases: ['-'],
  description: 'Subtracts multiple numbers from the first number (prefix notation)',
  category: 'Calculator',
  handler: (args, context): CommandResult => {
    const operands = args._;
    
    if (operands.length < 2) {
      return {
        success: false,
        error: context.printError("Error: At least 2 operands required")
      };
    }
    
    try {
      const numbers = validateAndParseNumbers(operands);
      const result = numbers.reduce((acc, num, index) => {
        return index === 0 ? acc : acc - num;
      }, numbers[0]);
      const formattedResult = formatResult(result);
      
      return {
        success: true,
        output: context.printSuccess(`Result: ${formattedResult}`)
      };
    } catch (error) {
      return {
        success: false,
        error: context.printError((error as Error).message)
      };
    }
  }
};

export const multiplyCommand: Command = {
  name: 'mul',
  aliases: ['*'],
  description: 'Multiplies multiple numbers together (prefix notation)',
  category: 'Calculator',
  handler: (args, context): CommandResult => {
    const operands = args._;
    
    if (operands.length < 2) {
      return {
        success: false,
        error: context.printError("Error: At least 2 operands required")
      };
    }
    
    try {
      const numbers = validateAndParseNumbers(operands);
      const product = numbers.reduce((acc, num) => acc * num, 1);
      const formattedResult = formatResult(product);
      
      return {
        success: true,
        output: context.printSuccess(`Result: ${formattedResult}`)
      };
    } catch (error) {
      return {
        success: false,
        error: context.printError((error as Error).message)
      };
    }
  }
};

export const divideCommand: Command = {
  name: 'div',
  aliases: ['/'],
  description: 'Divides the first number by subsequent numbers (prefix notation)',
  category: 'Calculator',
  handler: (args, context): CommandResult => {
    const operands = args._;
    
    if (operands.length < 2) {
      return {
        success: false,
        error: context.printError("Error: At least 2 operands required")
      };
    }
    
    try {
      const numbers = validateAndParseNumbers(operands);
      
      // Check for division by zero
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === 0) {
          return {
            success: false,
            error: context.printError("Error: Division by zero is not allowed")
          };
        }
      }
      
      const result = numbers.reduce((acc, num, index) => {
        return index === 0 ? acc : acc / num;
      }, numbers[0]);
      const formattedResult = formatResult(result);
      
      return {
        success: true,
        output: context.printSuccess(`Result: ${formattedResult}`)
      };
    } catch (error) {
      return {
        success: false,
        error: context.printError((error as Error).message)
      };
    }
  }
};

// Unified command export for all calculator commands
export const calculatorCommands: Command[] = [
  addCommand,
  subtractCommand,
  multiplyCommand,
  divideCommand
];