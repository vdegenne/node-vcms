import {createServer} from 'http';
import {Model} from 'objection';

import {getApp, Routers} from './app';
import {VcmsOptions} from './config';
import {getConfig} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';


const logger = new Logger('server');


export interface StartupConfig {
  configFilepath?: string, routers: Routers
}

export async function startServer(startupConfig?: StartupConfig):
    Promise<void> {
  logger.log('Initialising server...');


  // get defaults & from-configuration-file configurations
  let config: VcmsOptions = await getConfig(
      (startupConfig && startupConfig.configFilepath) || undefined);

  // merge and/or add startup configurations
  if (startupConfig) {
    config = Object.assign({}, config, startupConfig);
  }

  if (config.DATABASE_REQUIRED) {
    try {
      const database = await getDatabase(config);
    } catch (e) {
      process.exit(1);
    }
  }

  const app = await getApp(config);
  const server = createServer(app);

  server.listen(config.PORT, () => {
    logger.success(`Listening http://${config.LOCAL_HOSTNAME}:${config.PORT}`);
  });

  server.on('error', async (e) => {
    logger.error(e.message);
    process.exit(1);
  });
}
