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
    type: Boolean
  },
  {
    name: 'db-type',
    description: 'Type of the database (default: "pg")',
    type: String
  },
  {
    name: 'db-host',
    description: 'Host address of the database (default: "localhost:5432")',
    type: String
  },
  {
    name: 'db-port',
    description: 'Port of the databse to connect to (depends on db-host)',
    type: Number
  },
  {
    name: 'db-name',
    description: 'Name of the databse to connect to',
    type: String
  },
  {name: 'db-user', description: 'The name of the database user', type: String},
  {
    name: 'enable-session',
    alias: 's',
    description:
        'Enable the session module (use this if authentication is required)',
    type: Boolean
  },
  {
    name: 'redis-host',
    description: 'Redis Host (e.g. localhost:6379)',
    type: String
  }
];

export default commandArgs;
