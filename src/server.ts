import {createServer} from 'http';

import {getApp} from './app';
import {VcmsOptions} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';
import {getConfig} from './vcms';


const logger = new Logger('server');


export async function startServer(configFilepath?: string): Promise<void> {
  let config: VcmsOptions;

  if (configFilepath) {
    config = await getConfig(true, configFilepath);
  } else {
    config = await getConfig();
  }

  if (config.DATABASE_REQUIRED) {
    try {
      await getDatabase();
    } catch (e) {
      console.log('fuck');
      process.exit(1);
    }
  }

  const app = await getApp();
  const server = createServer(app);

  logger.info('starting...');
  server.listen(config.PORT, () => {
    logger.info(`Listening on port ${config.PORT}`);
  });

  server.on('error', async (e) => {
    logger.error(e.message);
    process.exit(1);
  });
}
