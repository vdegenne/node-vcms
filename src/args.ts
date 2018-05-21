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
    name: 'local-hostname',
    alias: 'h',
    description: 'The Local Hostname (e.g. "localhost", "app.example.local")',
    type: String
  },
  {
    name: 'http2',
    description: 'Enable or not http2 (default: false).',
    type: Boolean
  },
  {
    name: 'http2-key',
    description: 'Path to the https key if http2 is enabled.',
    type: String
  },
  {
    name: 'http2-cert',
    description: ',Path to the https certificate if http2 is enabled.',
    type: String
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
  },
  {
    name: 'session-cookie-domain',
    description:
        'Domain of the Session cookie (e.g. ".example.com"). That option lets you exchange session data between application in the same domain scope',
    type: String
  },
  {
    name: 'public-directory',
    description: 'public directory for static files (default: public)',
    type: String
  }
];

export default commandArgs;
