import {RequestHandler} from 'express';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {createServer} from 'http';
import {createServer as createHttp2Server} from 'spdy';

import {getApp, Routers} from './app';
import {VcmsOptions} from './config';
import {getConfig} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';
import {getSession} from './redis-session';
import {Session} from './session';


const logger = new Logger('server');


export interface StartupConfig {
  configFilepath?: string;
  routers?: Routers;
  initSessionFunction?: (session: Express.Session) => void;
  middlewares?: RequestHandler[];
  publicDirectory?: string;
}


export async function startServer(startupConfigFilepath?: string):
    Promise<void> {
  logger.log('Initialising server...');


  try {
    // get defaults & from-configuration-file configurations
    let config: VcmsOptions = await getConfig(startupConfigFilepath);

    logger.info(`Using NODE_ENV=${config.NODE_ENV}`);


    if (config.DATABASE_REQUIRED) {
      await getDatabase(config);
    }

    let session: Session;
    if (config.SESSION_REQUIRED) {
      session = await getSession(config);
    }

    const app = await getApp(config, session);

    let server;
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


    server.listen(config.PORT, (err: Error) => {
      if (err) {
        throw new Error(err.message);
      }

      logger.success(`Listening http${config.HTTP2_REQUIRED ? 's' : ''}://${
          config.LOCAL_HOSTNAME}:${config.PORT}`);
    });


    server.on('error', async (e) => {
      logger.error(e.message);
      process.exit(1);
    });

  } catch (e) {
    if (!['config', 'database'].includes(e.name)) {
      logger.error(e.message);
    }
    console.error('Something went wrong. exiting.');
    process.exit(1);
  }
}
