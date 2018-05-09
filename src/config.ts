import * as commandLineArgs from 'command-line-args';
import {existsSync, readFileSync} from 'fs';
import {safeLoad} from 'js-yaml';

import commandArgs from './args';


/* defaults */
const defaultOptions: VcmsOptions = {
  NODE_ENV: 'prod',
  PORT: 8000,

  DATABASE_REQUIRED: false,
  DB_HOST: 'localhost:5432',

  DB_TYPE: 'pg',

  SESSION_REQUIRED: false,
  REDIS_HOST: 'localhost:6379'
};


let config: VcmsOptions = undefined;
export let configFromFile: ConfigFileOptions = undefined;
export let configFromCommandLine: CommandLineOptions = undefined;



export async function getConfig(
    forceUpdate: boolean = false,
    configFilepath?: string): Promise<VcmsOptions> {
  if (!config || forceUpdate) {
    await update(configFilepath);
  }
  return config;
}


export async function update(
    configFilepath: string = process.cwd() + '/.vcms.yml'): Promise<void> {
  const newconfig: VcmsWritableOptions = Object.assign({}, defaultOptions);


  /* check if there is a configuration file */
  if (existsSync(configFilepath)) {
    configFromFile =
        <ConfigFileOptions>safeLoad(readFileSync(configFilepath).toString());
  }



  /*===========
   = NODE_ENV =
   ===========*/
  if (true) {
    /* from file */
    if (configFromFile && configFromFile['node-env']) {
      newconfig.NODE_ENV = configFromFile['node-env']
    }
    /* from process.env */
    if (process.env.NODE_ENV &&
        ['test', 'dev', 'prod'].includes(process.env.NODE_ENV)) {
      newconfig.NODE_ENV = process.env.NODE_ENV
    }
    /* from command line */
    /* TO IMPLEMENT */
  }

  /* check for command-line options */
  configFromCommandLine = commandLineArgs(commandArgs);


  /*===========
   =   PORT   =
   ===========*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[newconfig.NODE_ENV] &&
          configFromFile[newconfig.NODE_ENV].port) {
        newconfig.PORT = configFromFile[newconfig.NODE_ENV].port
      } else if (configFromFile.port) {
        newconfig.PORT = configFromFile.port
      }
    }
    /* from process.env */
    if (process.env.PORT) {
      newconfig.PORT = parseInt(process.env.PORT);
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine.port) {
      newconfig.PORT = configFromCommandLine.port;
    }
  }


  /*====================
   = DATABASE_REQUIRED =
   ====================*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[newconfig.NODE_ENV] &&
          configFromFile[newconfig.NODE_ENV].database) {
        newconfig.DATABASE_REQUIRED =
            configFromFile[newconfig.NODE_ENV].database
      } else if (configFromFile.database) {
        newconfig.DATABASE_REQUIRED = configFromFile.database
      }
    }
    /* from process.env */
    if (process.env.DATABASE_REQUIRED) {
      newconfig.DATABASE_REQUIRED =
          process.env.DATABASE_REQUIRED.toLowerCase() === 'true' ? true : false;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['enable-database']) {
      newconfig.DATABASE_REQUIRED = configFromCommandLine['enable-database'];
    }
  }

  // in case the database is required
  if (newconfig.DATABASE_REQUIRED) {
    /*===========
     = DB_TYPE  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-type']) {
          newconfig.DB_TYPE = configFromFile[newconfig.NODE_ENV]['db-type']
        } else if (configFromFile['db-type']) {
          newconfig.DB_TYPE = configFromFile['db-type'];
        }
      }
      /* from process.env */
      if (process.env.DB_TYPE) {
        newconfig.DB_TYPE = process.env.DB_TYPE;
      }
      /* from command line */
      /* TO IMPLEMENT */
    }


    /*===========
     = DB_HOST  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-host']) {
          newconfig.DB_HOST = configFromFile[newconfig.NODE_ENV]['db-host']
        } else if (configFromFile['db-host']) {
          newconfig.DB_HOST = configFromFile['db-host']
        }
      }
      /* from process.env */
      if (process.env.DB_HOST) {
        if (process.env.DB_HOST === 'DOCKER_HOST') {
          if (!process.env.DOCKER_HOST) {
            throw new Error('DOCKER_HOST is not defined.');
          }
          newconfig.DB_HOST = process.env.DOCKER_HOST
        } else {
          newconfig.DB_HOST = process.env.DB_HOST;
        }
      }
      /* from command line */
      /* TO IMPLEMENT */
    }

    // format DB_HOST in case it contains the port
    if (newconfig.DB_HOST.indexOf(':') > -1) {
      const dbHostParts = newconfig.DB_HOST.split(':');
      newconfig.DB_HOST = dbHostParts[0];
      newconfig.DB_PORT = parseInt(dbHostParts[1]);
    }

    /*===========
     = DB_PORT  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-port']) {
          newconfig.DB_PORT = configFromFile[newconfig.NODE_ENV]['db-port']
        } else if (configFromFile['db-port']) {
          newconfig.DB_PORT = parseInt(configFromFile['db-port']);
        }
      }
      /* from process.env */
      if (process.env.DB_PORT) {
        newconfig.DB_PORT = parseInt(process.env.DB_PORT);
      }
      /* from command line */
      /* TO IMPLEMENT */
    }

    // if no DB_PORT was found, resolve based on the type
    switch (newconfig.DB_TYPE) {
      case 'pg':
        newconfig.DB_PORT = 5432;
    }


    /*===========
     = DB_NAME  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-name']) {
          newconfig.DB_NAME = configFromFile[newconfig.NODE_ENV]['db-name']
        } else if (configFromFile['db-name']) {
          newconfig.DB_NAME = configFromFile['db-name'];
        }
      }
      /* from process.env */
      if (process.env.DB_NAME) {
        newconfig.DB_NAME = process.env.DB_NAME;
      }
      /* from command line */
      /* TO IMPLEMENT */
    }


    /*===========
     = DB_USER  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-user']) {
          newconfig.DB_USER = configFromFile[newconfig.NODE_ENV]['db-user']
        } else if (configFromFile['db-user']) {
          newconfig.DB_USER = configFromFile['db-user'];
        }
      }
      /* from process.env */
      if (process.env.DB_USER) {
        newconfig.DB_USER = process.env.DB_USER;
      }
      /* from command line */
      /* TO IMPLEMENT */
    }


    /*===============
     = DB_PASSWORD  =
     ===============*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[newconfig.NODE_ENV] &&
            configFromFile[newconfig.NODE_ENV]['db-password']) {
          newconfig.DB_PASSWORD =
              configFromFile[newconfig.NODE_ENV]['db-password']
        } else if (configFromFile['db-password']) {
          newconfig.DB_PASSWORD = configFromFile['db-password'];
        }
      }
      /* from process.env */
      if (process.env.DB_PASSWORD) {
        newconfig.DB_PASSWORD = process.env.DB_PASSWORD;
      }
      /* from command line */
      /* TO IMPLEMENT */
    }
  }



  /*===================
   = SESSION_REQUIRED =
   ===================*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[newconfig.NODE_ENV] &&
          configFromFile[newconfig.NODE_ENV].session) {
        newconfig.SESSION_REQUIRED = configFromFile[newconfig.NODE_ENV].session
      } else if (configFromFile.session) {
        newconfig.SESSION_REQUIRED = configFromFile.session
      }
    }
    /* from process.env */
    if (process.env.SESSION_REQUIRED) {
      newconfig.SESSION_REQUIRED =
          process.env.SESSION_REQUIRED.toLowerCase() === 'true' ? true : false;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['enable-session']) {
      newconfig.SESSION_REQUIRED = configFromCommandLine['enable-session'];
    }
  }


  /*=============
   = REDIS_HOST =
   =============*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[newconfig.NODE_ENV] &&
          configFromFile[newconfig.NODE_ENV]['redis-host']) {
        newconfig.REDIS_HOST = configFromFile[newconfig.NODE_ENV]['redis-host']
      } else if (configFromFile['redis-host']) {
        newconfig.REDIS_HOST = configFromFile['redis-host']
      }
    }
    /* from process.env */
    if (process.env.REDIS_HOST) {
      if (process.env.REDIS_HOST === 'DOCKER_HOST') {
        if (!process.env.DOCKER_HOST) {
          throw new Error('DOCKER_HOST is not defined.');
        }
        newconfig.REDIS_HOST = process.env.DOCKER_HOST
      } else {
        newconfig.REDIS_HOST = process.env.REDIS_HOST;
      }
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['redis-host']) {
      newconfig.REDIS_HOST = configFromCommandLine['redis-host'];
    }
  }


  // finally update the config
  config = newconfig;
}



/**
 * Vcms Writable Options
 * use this interface with the defaultOptions object and to initialize a default
 * Object with restricted values
 */
export interface VcmsWritableOptions {
  NODE_ENV: string;
  PORT: number;

  DATABASE_REQUIRED: boolean;
  DB_TYPE?: string;
  DB_HOST?: string;
  DB_PORT?: number;

  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;

  SESSION_REQUIRED: boolean;
  REDIS_HOST: string;
}

/**
 * Vcms Options
 * use this interface throughout the application, because environmental
 * variables shouldn't be changed during the execution of the program.
 */
export interface VcmsOptions extends VcmsWritableOptions {
  readonly NODE_ENV: string;
  readonly PORT: number;

  readonly DATABASE_REQUIRED: boolean;
  readonly DB_TYPE?: string;
  readonly DB_HOST?: string;
  readonly DB_PORT?: number;


  readonly DB_NAME?: string;
  readonly DB_USER?: string;
  readonly DB_PASSWORD?: string;


  readonly SESSION_REQUIRED: boolean;
  readonly REDIS_HOST: string;
}


export interface ConfigFileOptions extends ConfigFileOptionsBase {
  prod: ConfigFileOptionsBase;
  dev: ConfigFileOptionsBase;
  test: ConfigFileOptionsBase;

  'node-env'?: string;
}

export interface ConfigFileOptionsBase {
  port?: number;

  database?: boolean;
  'db-type'?: string;
  'db-host'?: string;
  'db-port'?: string;
  'db-name'?: string;
  'db-user'?: string;
  'db-password'?: string;

  session?: boolean;
  'redis-host'?: string;
}


export interface CommandLineOptions {
  port?: number;
  'enable-database'?: boolean;
  'enable-session'?: boolean;
  'redis-host'?: string;
}
