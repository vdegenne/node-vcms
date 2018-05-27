import {Application} from 'express';
import {existsSync, readFileSync} from 'fs';
import {createServer} from 'http';
import * as Knex from 'knex';
import {Server} from 'net';
import {createServer as createHttp2Server} from 'spdy';

import {getApp} from './app';
import {getConfig, VcmsOptions} from './config';
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


export async function getStructure(config: VcmsOptions): Promise<Structure> {
  const structure:
      Structure = {server: null, database: null, Session: null, app: null};


  logger.info(`Using NODE_ENV=${config.node_env}`);


  // database
  if (config.database_required) {
    structure.database = await getDatabase(config);
  }

  // session
  if (config.session_required) {
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
  if (structure.Session && structure.Session.connection) {
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

  if (config.http2_required) {
    if (!existsSync(config.http2_key)) {
      throw new Error(`The key for the https server can't be found`);
    }
    if (!existsSync(config.http2_cert)) {
      throw new Error(`The certificate for the https server can't be found`);
    }

    const options = {
      key: readFileSync(config.http2_key),
      cert: readFileSync(config.http2_cert)
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


    structure.server.listen(config.port, (error: Error) => {
      if (error) {
        throw new Error(error.message);
      }

      logger.success(`Listening http${config.http2_required ? 's' : ''}://${
          config.local_hostname}:${config.port}`);
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
