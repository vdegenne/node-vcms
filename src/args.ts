import * as commandLineArgs from 'command-line-args';
import {OptionDefinition} from 'command-line-args';

// possible arguments
const commandArgs: OptionDefinition[] = [
  {
    name: 'port',
    alias: 'p',
    description: 'Define the port which the app is going to use.',
    type: Number
  },
  {
    name: 'enable-database',
    description: 'Enable the database module',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'enable-session',
    description:
        'Enable the session module (use this if authentication is required)',
    type: Boolean,
    defaultValue: false
  }
];

export default commandArgs;
