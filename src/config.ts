import * as commandLineArgs from 'command-line-args';
import {RequestHandler, Router} from 'express';
import {RequestHandlerParams} from 'express-serve-static-core';
import {existsSync, readFileSync} from 'fs';
import {safeLoad} from 'js-yaml';

import {Routers} from './app';
import commandArgs from './args';
import {Logger} from './logging';


const logger = new Logger('config');

export type StartupFunction = (config: VcmsOptions) =>
    Promise<VcmsOptions>|VcmsOptions


/* defaults */
export const defaultOptions: VcmsOptions = {
  node_env: 'prod',
  port: 8000,
  local_hostname: 'localhost',

  http2_required: false,
  http2_key: './server.key',
  http2_cert: './server.crt',

  database_required: false,
  db_host: 'localhost:5432',
  db_type: 'pg',

  session_required: false,
  redis_host: 'localhost:6379'
};



export async function getConfig(
    startupConfigScriptPath?: string,
    configFilepath?: string): Promise<VcmsOptions> {
  let config: VcmsOptions = Object.assign({}, defaultOptions);

  /*===========
   = NODE_ENV =
   ===========*/
  /* from process.env */
  if (process.env.NODE_ENV &&
      ['test', 'dev', 'prod'].includes(process.env.NODE_ENV)) {
    config.node_env = process.env.NODE_ENV
  }


  /* STARTUP CONFIGURATION SCRIPT FILE */
  if (startupConfigScriptPath === undefined) {  // resolving to default
    const possiblePaths = [
      process.cwd(),
      process.cwd() + '/build',
      process.cwd() + '/lib',
      process.cwd() + '/test'
    ];

    const founds =
        possiblePaths.filter(p => existsSync(p + '/startupconfig.js'));

    if (founds.length) {
      startupConfigScriptPath = founds[0] + '/startupconfig.js';
    }
  }

  let startupconfig: VcmsOptions = undefined;
  if (startupConfigScriptPath) {
    if (existsSync(startupConfigScriptPath)) {
      logger.log(`Startup configuration script file resolved to "${
          startupConfigScriptPath}".`);

      const startupfunction = require(startupConfigScriptPath).default;

      if (typeof startupfunction !== 'function')
        throwError(
            'the startup script needs to export a function as the default');

      startupconfig = await startupfunction({node_env: config.node_env});
      // node_env can be overridden
      if (startupconfig.node_env) {
        config.node_env = startupconfig.node_env;
      }

    } else {
      throwError(`Startup configuration script "${
          startupConfigScriptPath}" couldn't be found`);
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


  /* check for command-line options */
  const configFromCommandLine: CommandLineOptions =
      commandLineArgs(commandArgs);


  /*===========
   =   PORT   =
   ===========*/
  // 1. file
  loadOption(
      'port',
      {file: {src: configFromFile, name: 'port', type: 'integer'}},
      config);
  // 2. startupconfig
  transferProperty('port', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'port',
      {
        env: {src: process.env, name: 'PORT', type: 'integer'},
        cmdline: {src: configFromCommandLine, name: 'port'}
      },
      config);

  /*=====================
   =   LOCAL_HOSTNAME   =
   =====================*/
  // 1. file
  loadOption(
      'local_hostname',
      {file: {src: configFromFile, name: 'local-hostname'}},
      config);
  // 2. startupconfig
  transferProperty('local_hostname', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'local_hostname',
      {
        file: {src: configFromFile, name: 'local-hostname'},
        env: {src: process.env, name: 'LOCAL_HOSTNAME'},
        cmdline: {src: configFromCommandLine, name: 'local-hostname'}
      },
      config);


  /*====================
   = HTTP2             =
   ====================*/
  // 1. file
  loadOption(
      'http2_required', {file: {src: configFromFile, name: 'http2'}}, config);
  // 2. startupconfig
  transferProperty('http2_required', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'http2_required',
      {
        env: {src: process.env, name: 'HTTP2_REQUIRED', type: 'boolean'},
        cmdline: {src: configFromCommandLine, name: 'http2'}
      },
      config);

  /*====================
   = HTTP2 CERT        =
   ====================*/
  // 1. file
  loadOption(
      'http2_cert', {file: {src: configFromFile, name: 'http2-cert'}}, config);
  // 2. startupconfig
  transferProperty('http2_cert', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'http2_cert',
      {
        env: {src: process.env, name: 'HTTP2_CERT'},
        cmdline: {src: configFromCommandLine, name: 'http2-cert'}
      },
      config);



  /*====================
   = HTTP2 KEY         =
   ====================*/
  // 1. file
  loadOption(
      'http2_key', {file: {src: configFromFile, name: 'http2-key'}}, config);
  // 2. startupconfig
  transferProperty('http2_key', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'http2_key',
      {
        env: {src: process.env, name: 'HTTP2_KEY'},
        cmdline: {src: configFromCommandLine, name: 'http2-key'}
      },
      config);



  /*====================
   = DATABASE_REQUIRED =
   ====================*/
  // 1. file
  loadOption(
      'database_required',
      {file: {src: configFromFile, name: 'database'}},
      config);
  // 2. startupconfig
  transferProperty('database_required', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'database_required',
      {
        env: {src: process.env, name: 'DATABASE_REQUIRED', type: 'boolean'},
        cmdline: {src: configFromCommandLine, name: 'enable-database'}
      },
      config);

  // in case the database is required
  if (config.database_required) {
    /*===========
     = DB_TYPE  =
     ===========*/
    // 1. file
    loadOption(
        'db_type', {file: {src: configFromFile, name: 'db-type'}}, config);
    // 2. startupconfig
    transferProperty('db_type', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_type',
        {
          env: {src: process.env, name: 'DB_TYPE'}
          // to implement command-line
        },
        config);

    /*===========
     = DB_HOST  =
     ===========*/
    // 1. file
    loadOption(
        'db_host', {file: {src: configFromFile, name: 'db-host'}}, config);
    // 2. startupconfig
    transferProperty('db_host', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_host',
        {
          env: {src: process.env, name: 'DB_HOST'}
          // to implement command-line
        },
        config);

    // format DB_HOST in case it contains the port
    if (config.db_host.indexOf(':') > -1) {
      const dbHostParts = config.db_host.split(':');
      config.db_host = dbHostParts[0];
      config.db_port = parseInt(dbHostParts[1]);
    }

    /*===========
     = DB_PORT  =
     ===========*/
    // 1. file
    loadOption(
        'db_port', {file: {src: configFromFile, name: 'db-port'}}, config);
    // 2. startupconfig
    transferProperty('db_port', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_port',
        {
          env: {src: process.env, name: 'DB_PORT'},
          cmdline: {src: configFromCommandLine, name: 'db-port'}
        },
        config);

    // if no DB_PORT was found, resolve based on the type
    if (!config.db_port) {
      switch (config.db_type) {
        case 'pg':
          config.db_port = 5432;
      }
    }

    /*===========
     = DB_NAME  =
     ===========*/
    // 1. file
    loadOption(
        'db_name', {file: {src: configFromFile, name: 'db-name'}}, config);
    // 2. startupconfig
    transferProperty('db_name', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_name',
        {
          env: {src: process.env, name: 'DB_NAME'},
          cmdline: {src: configFromCommandLine, name: 'db-name'}
        },
        config);

    /*===========
     = DB_USER  =
     ===========*/
    // 1. file
    loadOption(
        'db_user', {file: {src: configFromFile, name: 'db-user'}}, config);
    // 2. startupconfig
    transferProperty('db_user', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_user',
        {
          env: {src: process.env, name: 'DB_USER'},
          cmdline: {src: configFromCommandLine, name: 'db-user'}
        },
        config);

    /*===============
     = DB_PASSWORD  =
     ===============*/
    // 1. file
    loadOption(
        'db_password',
        {file: {src: configFromFile, name: 'db-password'}},
        config);
    // 2. startupconfig
    transferProperty('db_password', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'db_password',
        {
          env: {src: process.env, name: 'DB_PASSWORD'},
          // to implement command-line
        },
        config);
  }

  /*===================
   = SESSION_REQUIRED =
   ===================*/
  // 1. file
  loadOption(
      'session_required',
      {file: {src: configFromFile, name: 'session'}},
      config);
  // 2. startupconfig
  transferProperty('session_required', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'session_required',
      {
        env: {src: process.env, name: 'SESSION_REQUIRED', type: 'boolean'},
        cmdline: {src: configFromCommandLine, name: 'enable-session'}
      },
      config);

  // if session is required, specific options
  if (config.session_required) {
    /*=============
     = REDIS_HOST =
     =============*/
    // 1. file
    loadOption(
        'redis_host',
        {file: {src: configFromFile, name: 'redis-host'}},
        config);
    // 2. startupconfig
    transferProperty('redis_host', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'redis_host',
        {
          env: {src: process.env, name: 'REDIS_HOST'},
          cmdline: {src: configFromCommandLine, name: 'redis-host'}
        },
        config);


    /*============================
     =   SESSION_COOKIE_DOMAIN   =
     ============================*/
    // 1. file
    loadOption(
        'session_cookie_domain',
        {file: {src: configFromFile, name: 'session-cookie-domain'}},
        config);
    // 2. startupconfig
    transferProperty('session_cookie_domain', startupconfig, config);
    // 3. environment and command-line
    loadOption(
        'session_cookie_domain',
        {
          env: {src: process.env, name: 'SESSION_COOKIE_DOMAIN'},
          cmdline: {src: configFromCommandLine, name: 'session-cookie-domain'}
        },
        config);
  }


  /*=======================
   =   static             =
   =======================*/
  // 1. file
  loadOption('static', {file: {src: configFromFile, name: 'static'}}, config);
  // 2. startupconfig
  transferProperty('static', startupconfig, config);
  // 3. environment and command-line
  loadOption(
      'static',
      {
        env: {src: process.env, name: 'STATIC'},
        cmdline: {src: configFromCommandLine, name: 'static'}
      },
      config);


  /*=======================
   =   statics            =
   =======================*/
  // 1. file
  loadOption('statics', {file: {src: configFromFile, name: 'statics'}}, config);
  // 2. startupconfig
  transferProperty('statics', startupconfig, config);
  // we should convert the regexp routes
  if (config.statics) {
    for (const s of config.statics) {
      s.route = <string>s.route;
      if (typeof s.route !== 'object' && s.route !== '/' &&
          s.route.startsWith('/\\/') && s.route.endsWith('/')) {
        s.route = new RegExp(s.route.replace(/^\/|\/$/g, ''));
      }
    }
  }


  // add startup configurations to the main configuration object
  config = {...config, ...startupconfig};

  // we finally return the config
  return <VcmsOptions>config;
}


export type Static = {
  route: string|RegExp,
  serve: string
}


export interface VcmsOptions {
  node_env: string;
  port: number;
  local_hostname: string;

  http2_required: boolean;
  http2_key?: string;
  http2_cert?: string;


  database_required: boolean;
  db_type?: string;
  db_host?: string;
  db_port?: number;
  db_name?: string;
  db_user?: string;
  db_password?: string;

  session_required: boolean;
  redis_host?: string;
  session_cookie_domain?: string;

  configFilepath?: string;
  routers?: {[base: string]: Router|RequestHandler};
  initSessionFunction?: (session: Express.Session) => void;
  static?: string;
  statics?: Static[];
  middlewares?: RequestHandler[];
}


export interface ConfigFileOptions extends ConfigFileOptionsBase {
  prod: ConfigFileOptionsBase;
  dev: ConfigFileOptionsBase;
  test: ConfigFileOptionsBase;
}


export interface ConfigFileOptionsBase {
  port?: number;
  'local-hostname'?: string;

  http2?: boolean;
  'http2-key'?: string;
  'http2-cert'?: string;

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

  static?: string;
  'statics'?: Static[];
}

export interface CommandLineOptions {
  port?: number;
  'local-hostname'?: string;

  http2?: boolean;
  'http2-key'?: string;
  'http2-cert'?: string;

  'enable-database'?: boolean;
  'db-port'?: number;
  'db-name'?: string;
  'db-user'?: string;
  'redis-host'?: string;
  'session-cookie-domain'?: string;

  static?: string;
}

interface OptionSpecifier {
  name: string;
  src?: ConfigFileOptions|CommandLineOptions;
  type?: string
}

function loadOption(
    optionName: string,
    from: {
      file?: OptionSpecifier,
      env?: OptionSpecifier,
      cmdline?: OptionSpecifier
    },
    config: VcmsOptions) {
  /* from file */
  if (from.file && from.file.src) {
    const src = from.file.src;
    const name = from.file.name;
    if (src[config.node_env] && src[config.node_env][name]) {
      config[optionName] = src[config.node_env][name];
    } else if (src[name]) {
      config[optionName] = src[name];
    }
  }

  /* from process.env */
  if (from.env && process.env[from.env.name]) {
    config[optionName] = from.env.src[from.env.name];
    if (from.env.type === 'boolean') {
      config[optionName] =
          config[optionName].toLowerCase() === 'true' ? true : false;
    }
    if (from.env.type === 'integer') {
      config[optionName] = parseInt(config[optionName]);
    }

    // DOCKER FOR DB_HOST
    if (optionName === 'DB_HOST' && config[optionName] === 'DOCKER_HOST') {
      if (!from.env.src['DOCKER_HOST']) {
        throw new Error('DOCKER_HOST is not defined.');
      }
      config[optionName] = from.env.src['DOCKER_HOST'];
    }

    // DOCKER FRO REDIS_HOST
    if (optionName === 'REDIS_HOST' && config[optionName] === 'DOCKER_HOST') {
      if (!from.env.src['DOCKER_HOST']) {
        throw new Error('DOCKER_HOST is not defined.');
      }
      config[optionName] = from.env.src['DOCKER_HOST'];
    }
  }

  /* from command line */
  if (from.cmdline && from.cmdline.src && from.cmdline.src[from.cmdline.name]) {
    config[optionName] = from.cmdline.src[from.cmdline.name];
  }
}


function transferProperty(
    propName: string, from: VcmsOptions, to: VcmsOptions) {
  if (!from || !(propName in from)) {
    return;
  }

  to[propName] = from[propName];
  delete from[propName];
}


function throwError(message: string) {
  logger.error(message);
  const error = new Error(message);
  error.name = 'config';
  throw error;
}
