import * as commandLineArgs from 'command-line-args';
import {RequestHandler} from 'express';
import {existsSync, readFileSync} from 'fs';
import {safeLoad} from 'js-yaml';

import {Routers} from './app';
import commandArgs from './args';
import {Logger} from './logging';
import {StartupConfig} from './server';


const logger = new Logger('config');



/* defaults */
export const defaultOptions: VcmsOptions = {
  NODE_ENV: 'prod',
  PORT: 8000,
  LOCAL_HOSTNAME: 'localhost',

  DATABASE_REQUIRED: false,
  DB_HOST: 'localhost:5432',

  DB_TYPE: 'pg',

  SESSION_REQUIRED: false,
  REDIS_HOST: 'localhost:6379',

  publicDirectory: 'public'
};


export async function getConfig(
    startupConfigScriptPath?: string,
    configFilepath?: string): Promise<VcmsOptions> {
  const config: VcmsWritableOptions = Object.assign({}, defaultOptions);


  /* STARTUP CONFIGURATION SCRIPT FILE */
  // let userDefinedStartupConfigFilepath = startupConfigScriptPath ? true :
  // false;
  if (startupConfigScriptPath === undefined) {  // resolving to default
    const possiblePaths = [
      process.cwd(), process.cwd() + '/build', process.cwd() + '/lib',
      process.cwd() + '/test'
    ];

    const founds =
        possiblePaths.filter(p => existsSync(p + '/startupconfig.js'));

    if (founds.length) {
      startupConfigScriptPath = founds[0] + '/startupconfig.js';
    }
  }

  let startupconfig: StartupConfig = undefined;
  if (startupConfigScriptPath) {
    if (existsSync(startupConfigScriptPath)) {
      logger.log(`Startup configuration script file resolved to "${
          startupConfigScriptPath}".`);

      startupconfig = require(startupConfigScriptPath).default;
    } else {
      const errMsg = `Startup configuration script "${
          startupConfigScriptPath}" couldn't be found.`;
      logger.error(errMsg);
      // if (userDefinedStartupConfigFilepath) {  // throw an error if it was
      // intentionally set
      const error = new Error(errMsg);
      error.name = 'config';
      throw error;
      // }
    }
  } else {
    logger.info('!! No startup configuration script. Is it expected ?');
  }

  /* CONFIGURATION FILE */
  let userDefinedConfigFilepath = configFilepath ? true : false;
  if (configFilepath === undefined) {
    // resolve to default
    configFilepath = process.cwd() + '/.vcms.yml';
    userDefinedConfigFilepath = false;
  }
  // the startup config script can specify the configuration filepath
  if (startupconfig && startupconfig.configFilepath) {
    configFilepath = startupconfig.configFilepath;
    userDefinedConfigFilepath = true;
  }

  let configFromFile: ConfigFileOptions = undefined;
  if (configFilepath) {
    if (existsSync(configFilepath)) {
      logger.log(`Configuration file resolved to "${configFilepath}".`);

      configFromFile =
          <ConfigFileOptions>safeLoad(readFileSync(configFilepath).toString());
    } else {
      const errMsg =
          `Configuration file "${configFilepath}" couldn't be found.`;
      logger.error(errMsg);
      if (userDefinedConfigFilepath) {
        const error = new Error(errMsg);
        error.name = 'config';
        throw error;
      }
    }
  }


  /*===========
   = NODE_ENV =
   ===========*/
  if (true) {
    /* from process.env */
    if (process.env.NODE_ENV &&
        ['test', 'dev', 'prod'].includes(process.env.NODE_ENV)) {
      config.NODE_ENV = process.env.NODE_ENV
    }
  }


  /* check for command-line options */
  const configFromCommandLine = commandLineArgs(commandArgs);

  /*===========
   =   PORT   =
   ===========*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[config.NODE_ENV] &&
          configFromFile[config.NODE_ENV].port) {
        config.PORT = configFromFile[config.NODE_ENV].port
      } else if (configFromFile.port) {
        config.PORT = configFromFile.port
      }
    }
    /* from process.env */
    if (process.env.PORT) {
      config.PORT = parseInt(process.env.PORT);
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine.port) {
      config.PORT = configFromCommandLine.port;
    }
  }


  /*=====================
   =   LOCAL_HOSTNAME   =
   =====================*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[config.NODE_ENV] &&
          configFromFile[config.NODE_ENV]['local-hostname']) {
        config.LOCAL_HOSTNAME =
            configFromFile[config.NODE_ENV]['local-hostname']
      } else if (configFromFile['local-hostname']) {
        config.LOCAL_HOSTNAME = configFromFile['local-hostname']
      }
    }
    /* from process.env */
    if (process.env.LOCAL_HOSTNAME) {
      config.LOCAL_HOSTNAME = process.env.LOCAL_HOSTNAME;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['local-hostname']) {
      config.LOCAL_HOSTNAME = configFromCommandLine['local-hostname'];
    }
  }



  /*====================
   = DATABASE_REQUIRED =
   ====================*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[config.NODE_ENV] &&
          configFromFile[config.NODE_ENV].database) {
        config.DATABASE_REQUIRED = configFromFile[config.NODE_ENV].database
      } else if (configFromFile.database) {
        config.DATABASE_REQUIRED = configFromFile.database
      }
    }
    /* from process.env */
    if (process.env.DATABASE_REQUIRED) {
      config.DATABASE_REQUIRED =
          process.env.DATABASE_REQUIRED.toLowerCase() === 'true' ? true : false;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['enable-database']) {
      config.DATABASE_REQUIRED = configFromCommandLine['enable-database'];
    }
  }

  // in case the database is required
  if (config.DATABASE_REQUIRED) {
    /*===========
     = DB_TYPE  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-type']) {
          config.DB_TYPE = configFromFile[config.NODE_ENV]['db-type']
        } else if (configFromFile['db-type']) {
          config.DB_TYPE = configFromFile['db-type'];
        }
      }
      /* from process.env */
      if (process.env.DB_TYPE) {
        config.DB_TYPE = process.env.DB_TYPE;
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
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-host']) {
          config.DB_HOST = configFromFile[config.NODE_ENV]['db-host']
        } else if (configFromFile['db-host']) {
          config.DB_HOST = configFromFile['db-host']
        }
      }
      /* from process.env */
      if (process.env.DB_HOST) {
        if (process.env.DB_HOST === 'DOCKER_HOST') {
          if (!process.env.DOCKER_HOST) {
            throw new Error('DOCKER_HOST is not defined.');
          }
          config.DB_HOST = process.env.DOCKER_HOST
        } else {
          config.DB_HOST = process.env.DB_HOST;
        }
      }
      /* from command line */
      /* TO IMPLEMENT */
    }

    // format DB_HOST in case it contains the port
    if (config.DB_HOST.indexOf(':') > -1) {
      const dbHostParts = config.DB_HOST.split(':');
      config.DB_HOST = dbHostParts[0];
      config.DB_PORT = parseInt(dbHostParts[1]);
    }

    /*===========
     = DB_PORT  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-port']) {
          config.DB_PORT = configFromFile[config.NODE_ENV]['db-port']
        } else if (configFromFile['db-port']) {
          config.DB_PORT = parseInt(configFromFile['db-port']);
        }
      }
      /* from process.env */
      if (process.env.DB_PORT) {
        config.DB_PORT = parseInt(process.env.DB_PORT);
      }
      /* from command line */
      if (configFromCommandLine && configFromCommandLine['db-port']) {
        config.DB_PORT = configFromCommandLine['db-port'];
      }
    }

    // if no DB_PORT was found, resolve based on the type
    if (!config.DB_PORT) {
      switch (config.DB_TYPE) {
        case 'pg':
          config.DB_PORT = 5432;
      }
    }

    /*===========
     = DB_NAME  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-name']) {
          config.DB_NAME = configFromFile[config.NODE_ENV]['db-name']
        } else if (configFromFile['db-name']) {
          config.DB_NAME = configFromFile['db-name'];
        }
      }
      /* from process.env */
      if (process.env.DB_NAME) {
        config.DB_NAME = process.env.DB_NAME;
      }
      /* from command line */
      if (configFromCommandLine && configFromCommandLine['db-name']) {
        config.DB_NAME = configFromCommandLine['db-name'];
      }
    }

    /*===========
     = DB_USER  =
     ===========*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-user']) {
          config.DB_USER = configFromFile[config.NODE_ENV]['db-user']
        } else if (configFromFile['db-user']) {
          config.DB_USER = configFromFile['db-user'];
        }
      }
      /* from process.env */
      if (process.env.DB_USER) {
        config.DB_USER = process.env.DB_USER;
      }
      /* from command line */
      if (configFromCommandLine && configFromCommandLine['db-user']) {
        config.DB_USER = configFromCommandLine['db-user'];
      }
    }

    /*===============
     = DB_PASSWORD  =
     ===============*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['db-password']) {
          config.DB_PASSWORD = configFromFile[config.NODE_ENV]['db-password']
        } else if (configFromFile['db-password']) {
          config.DB_PASSWORD = configFromFile['db-password'];
        }
      }
      /* from process.env */
      if (process.env.DB_PASSWORD) {
        config.DB_PASSWORD = process.env.DB_PASSWORD;
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
      if (configFromFile[config.NODE_ENV] &&
          configFromFile[config.NODE_ENV].session) {
        config.SESSION_REQUIRED = configFromFile[config.NODE_ENV].session
      } else if (configFromFile.session) {
        config.SESSION_REQUIRED = configFromFile.session
      }
    }
    /* from process.env */
    if (process.env.SESSION_REQUIRED) {
      config.SESSION_REQUIRED =
          process.env.SESSION_REQUIRED.toLowerCase() === 'true' ? true : false;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['enable-session']) {
      config.SESSION_REQUIRED = configFromCommandLine['enable-session'];
    }
  }

  // if session is required, specific options
  if (config.SESSION_REQUIRED) {
    /*=============
     = REDIS_HOST =
     =============*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['redis-host']) {
          config.REDIS_HOST = configFromFile[config.NODE_ENV]['redis-host']
        } else if (configFromFile['redis-host']) {
          config.REDIS_HOST = configFromFile['redis-host']
        }
      }
      /* from process.env */
      if (process.env.REDIS_HOST) {
        if (process.env.REDIS_HOST === 'DOCKER_HOST') {
          if (!process.env.DOCKER_HOST) {
            throw new Error('DOCKER_HOST is not defined.');
          }
          config.REDIS_HOST = process.env.DOCKER_HOST
        } else {
          config.REDIS_HOST = process.env.REDIS_HOST;
        }
      }
      /* from command line */
      if (configFromCommandLine && configFromCommandLine['redis-host']) {
        config.REDIS_HOST = configFromCommandLine['redis-host'];
      }
    }


    /*============================
     =   SESSION_COOKIE_DOMAIN   =
     ============================*/
    if (true) {
      /* from file */
      if (configFromFile) {
        if (configFromFile[config.NODE_ENV] &&
            configFromFile[config.NODE_ENV]['session-cookie-domain']) {
          config.SESSION_COOKIE_DOMAIN =
              configFromFile[config.NODE_ENV]['session-cookie-domain']
        } else if (configFromFile.port) {
          config.SESSION_COOKIE_DOMAIN = configFromFile['session-cookie-domain']
        }
      }
      /* from process.env */
      if (process.env.SESSION_COOKIE_DOMAIN) {
        config.SESSION_COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN;
      }
      /* from command line */
      if (configFromCommandLine &&
          configFromCommandLine['session-cookie-domain']) {
        config.SESSION_COOKIE_DOMAIN =
            configFromCommandLine['session-cookie-domain'];
      }
    }
  }

  /*=======================
   =   PUBLIC_DIRECTORY   =
   =======================*/
  if (true) {
    /* from file */
    if (configFromFile) {
      if (configFromFile[config.NODE_ENV] &&
          configFromFile[config.NODE_ENV]['public-directory']) {
        config.publicDirectory =
            configFromFile[config.NODE_ENV]['public-directory']
      } else if (configFromFile['public-directory']) {
        config.publicDirectory = configFromFile['public-directory']
      }
    }
    /* from process.env */
    if (process.env.PUBLIC_DIRECTORY) {
      config.publicDirectory = process.env.PUBLIC_DIRECTORY;
    }
    /* from command line */
    if (configFromCommandLine && configFromCommandLine['public-directory']) {
      config.publicDirectory = configFromCommandLine['public-directory'];
    }
  }

  // add startup configurations to the main configuration object
  Object.assign(config, startupconfig);

  // we finally return the config
  return <VcmsOptions>config;
}

/**
 * Vcms Writable Options
 * use this interface with the defaultOptions object and to initialize a
 * default Object with restricted values
 */
export interface VcmsWritableOptions {
  NODE_ENV: string;
  PORT: number;
  LOCAL_HOSTNAME: string;

  DATABASE_REQUIRED: boolean;
  DB_TYPE?: string;
  DB_HOST?: string;
  DB_PORT?: number;

  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;

  SESSION_REQUIRED: boolean;
  REDIS_HOST?: string;
  SESSION_COOKIE_DOMAIN?: string;

  configFilepath?: string;
  routers?: Routers;
  initSessionFunction?: (session: Express.Session) => void;
  publicDirectory?: string;
  middlewares?: RequestHandler[];
}

/**
 * Vcms Options
 * use this interface throughout the application, because environmental
 * variables shouldn't be changed during the execution of the program.
 */
export interface VcmsOptions extends VcmsWritableOptions {
  readonly NODE_ENV: string;
  readonly PORT: number;
  readonly LOCAL_HOSTNAME: string;

  readonly DATABASE_REQUIRED: boolean;
  readonly DB_TYPE?: string;
  readonly DB_HOST?: string;
  readonly DB_PORT?: number;

  readonly DB_NAME?: string;
  readonly DB_USER?: string;
  readonly DB_PASSWORD?: string;

  readonly SESSION_REQUIRED: boolean;
  readonly REDIS_HOST?: string;
  readonly SESSION_COOKIE_DOMAIN?: string;
}

export interface ConfigFileOptions extends ConfigFileOptionsBase {
  prod: ConfigFileOptionsBase;
  dev: ConfigFileOptionsBase;
  test: ConfigFileOptionsBase;

  'node-env'?: string;
}

export interface ConfigFileOptionsBase {
  port?: number;
  'local-hostname'?: string;

  database?: boolean;
  'db-type'?: string;
  'db-host'?: string;
  'db-port'?: string;
  'db-name'?: string;
  'db-user'?: string;
  'db-password'?: string;

  session?: boolean;
  'redis-host'?: string;
  'session-cookie-domain'?: string;

  'public-directory'?: string;
}

export interface CommandLineOptions {
  port?: number;
  'local-hostname'?: string;
  'enable-database'?: boolean;
  'db-port'?: number;
  'db-name'?: string;
  'db-user'?: string;
  'redis-host'?: string;
  'session-cookie-domain'?: string;
  'public-directory'?: string;
}
