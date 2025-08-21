import React from 'react';
import { Command } from '../types';

export const echoCommand: Command = {
  name: 'echo',
  description: 'Prints the given text back to the terminal.',
  aliases: ['print', 'say'],
  args: [
    {
      name: 'text',
      description: 'One or more strings to be printed.',
      required: true,
      variadic: true,
    },
    {
      name: 'uppercase',
      description: 'Print the text in uppercase.',
      required: false,
      alias: 'u',
      type: 'boolean',
    }
  ],
  handler: (args) => {
    // The parser puts positional arguments in the `_` property.
    let textToEcho = (args._ as string[])?.join(' ') || '';

    // The parser now resolves aliases, so we only need to check for 'uppercase'
    if (args.uppercase) {
      textToEcho = textToEcho.toUpperCase();
    }
    
    return <p>{textToEcho}</p>;
  }
};
