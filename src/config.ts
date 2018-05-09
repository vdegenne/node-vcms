import * as commandLineArgs from 'command-line-args';
import {existsSync, readFileSync} from 'fs';
import {safeLoad} from 'js-yaml';

import commandArgs from './args';



export interface ConfigFileOptionsBase {
  port?: number;
  database?: boolean;
  'db-host'?: string;
  session?: boolean;
  'redis-host'?: string;
}

export interface ConfigFileOptions extends ConfigFileOptionsBase {
  prod: ConfigFileOptionsBase;
  dev: ConfigFileOptionsBase;
  test: ConfigFileOptionsBase;

  'node-env'?: string;
}

export interface CommandLineOptions {
  port?: number;
  'enable-database'?: boolean;
  'enable-session'?: boolean;
  'redis-host'?: string;
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
  DB_HOST: string;

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
  readonly DB_HOST: string;

  readonly SESSION_REQUIRED: boolean;
  readonly REDIS_HOST: string;
}


/* defaults */
const defaultOptions: VcmsOptions = {
  NODE_ENV: 'prod',
  PORT: 8000,

  DATABASE_REQUIRED: false,
  DB_HOST: 'localhost:5432',

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


  /* check for command-line options */
  configFromCommandLine = commandLineArgs(commandArgs);



  /*===========
   =   PORT   =
   ===========*/
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



  /*====================
   = DATABASE_REQUIRED =
   ====================*/
  /* from file */
  if (configFromFile) {
    if (configFromFile[newconfig.NODE_ENV] &&
        configFromFile[newconfig.NODE_ENV].database) {
      newconfig.DATABASE_REQUIRED = configFromFile[newconfig.NODE_ENV].database
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



  /*===========
   = DB_HOST  =
   ===========*/
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


  /*===================
   = SESSION_REQUIRED =
   ===================*/
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


  /*=============
   = REDIS_HOST =
   =============*/
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

  config = newconfig;
}
