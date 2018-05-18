import {RequestHandler} from 'express';
import {writeFileSync} from 'fs';
import {createServer} from 'http';

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
    const server = createServer(app);

    server.listen(config.PORT, () => {
      logger.success(
          `Listening http://${config.LOCAL_HOSTNAME}:${config.PORT}`);
    });

    server.on('error', async (e) => {
      logger.error(e.message);
      process.exit(1);
    });

  } catch (e) {
    if (!['config'].includes(e.name)) {
      logger.error(e.message);
    }
    console.error('Something went wrong. exiting.');
    process.exit(1);
  }
}
