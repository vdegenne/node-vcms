import {RequestHandler} from 'express';
import {createServer} from 'http';
import {Model} from 'objection';

import {getApp, Routers} from './app';
import {VcmsOptions} from './config';
import {getConfig} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';


const logger = new Logger('server');


export interface StartupConfig {
  configFilepath?: string;
  routers?: Routers;
  initSessionFunction?: (session: Express.Session) => void;
  middlewares?: RequestHandler[];
  publicDirectory?: string;
}


export async function startServer(startupConfig?: StartupConfig):
    Promise<void> {
  logger.log('Initialising server...');


  // prepare configFilepath
  let configFilepath: string = process.cwd() + '/.vcms.yml';  // default
  if (startupConfig.configFilepath) {
    configFilepath = startupConfig.configFilepath;
  }
  logger.log(`Configuration file at "${configFilepath}" will be used.`);

  try {
    // get defaults & from-configuration-file configurations
    let config: VcmsOptions = await getConfig(configFilepath);

    // merge and/or add startup configurations
    if (startupConfig) {
      config = Object.assign({}, config, startupConfig);
    }

    if (config.DATABASE_REQUIRED) {
      await getDatabase(config);
    }

    const app = await getApp(config);
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
    console.error('Something went wrong. exiting.');
    process.exit(1);
  }
}
