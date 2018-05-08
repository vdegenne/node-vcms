import * as commandLineArgs from 'command-line-args';
import {OptionDefinition} from 'command-line-args';

// possible arguments
const commandArgs: OptionDefinition[] = [
  {
    name: 'port',
    alias: 'p',
    description: 'Define the port which the app is going to use.',
    type: Number,
    defaultValue: 3000
  },
  {
    name: 'enable-session',
    description: 'Enable the session (use this if authentication is required)',
    type: Boolean,
    defaultValue: false
  }
];

export default commandArgs;
