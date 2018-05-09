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
    alias: 'd',
    description: 'Enable the database module',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'enable-session',
    alias: 's',
    description:
        'Enable the session module (use this if authentication is required)',
    type: Boolean,
    defaultValue: false
  },
  {
    name: 'redis-host',
    description: 'Redis Host (e.g. localhost:6379)',
    type: String
  }
];

export default commandArgs;
