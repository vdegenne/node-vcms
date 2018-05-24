import {Application, RequestHandler} from 'express';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {createServer} from 'http';
import * as Knex from 'knex';
import {Server} from 'net';
import {createServer as createHttp2Server} from 'spdy';

import {getApp, Routers} from './app';
import {VcmsOptions} from './config';
import {getConfig} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';
import {getSession} from './redis-session';
import {Session} from './session';


const logger = new Logger('server');



export interface Structure {
  server: Server;
  database: Knex;
  Session: Session;
  app: Application;
}



export interface StartupConfig {
  configFilepath?: string;
  routers?: Routers;
  initSessionFunction?: (session: Express.Session) => void;
  middlewares?: RequestHandler[];
  publicDirectory?: string;
}



export async function getStructure(config: VcmsOptions): Promise<Structure> {
  const structure:
      Structure = {server: null, database: null, Session: null, app: null};


  logger.info(`Using NODE_ENV=${config.NODE_ENV}`);


  // database
  if (config.DATABASE_REQUIRED) {
    structure.database = await getDatabase(config);
  }

  // session
  if (config.SESSION_REQUIRED) {
    structure.Session = await getSession(config);
  }

  // app (express)
  structure.app = await getApp(config, structure.Session);


  // server
  structure.server = await getServer(config, structure.app);


  return structure;
}


export async function destroyStructure(structure: Structure) {
  // close the database
  if (structure.database) {
    await structure.database.destroy();
  }
  // close the session
  if (structure.Session.connection) {
    switch (structure.Session.type) {
      case 'redis':
        await structure.Session.connection.quit();
        break;
      default:
        logger.log('session type unknown');
    }
  }
  structure = null;
}


export async function getServer(
    config: VcmsOptions, app: Application): Promise<Server> {
  let server: Server;

  if (config.HTTP2_REQUIRED) {
    if (!existsSync(config.HTTP2_KEY)) {
      throw new Error(`The key for the https server can't be found`);
    }
    if (!existsSync(config.HTTP2_CERT)) {
      throw new Error(`The certificate for the https server can't be found`);
    }

    const options = {
      key: readFileSync(config.HTTP2_KEY),
      cert: readFileSync(config.HTTP2_CERT)
    };

    logger.log('Creating http2 server...');
    server = createHttp2Server(options, app);
  } else {
    logger.log('Creating basic http server...');
    server = createServer(app);
  }

  return server;
}



/**
 * @param {string} startupFilepath entrypoint configuration script path.
 *    This script lets you define all the dynamic configuration of your
 *    application, e.g. the routers, the middlewares, the path to a static
 *    configuration file, ...
 */
export async function startServer(startupFilepath?: string) {
  logger.log('Initialising server...');
  try {
    // get defaults & from-configuration-file configurations
    let config: VcmsOptions = await getConfig(startupFilepath);

    // get the structure of all the application/server
    // only one dependency => the configuration object
    const structure = await getStructure(config);


    structure.server.listen(config.PORT, (error: Error) => {
      if (error) {
        throw new Error(error.message);
      }

      logger.success(`Listening http${config.HTTP2_REQUIRED ? 's' : ''}://${
          config.LOCAL_HOSTNAME}:${config.PORT}`);
    });

    // structure.server.on('error', async (e) => {
    //   logger.error(e.message);
    //   process.exit(1);
    // });


  } catch (e) {
    if (!['config', 'database'].includes(e.name)) {
      logger.error(e.message);
    }

    console.error('Something went wrong. exiting.');
    process.exit(1);
  }
}
