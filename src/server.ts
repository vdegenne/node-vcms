import {createServer} from 'http';
import {Model} from 'objection';

import {getApp} from './app';
import {VcmsOptions} from './config';
import {getDatabase} from './database';
import {Logger} from './logging';
import {getConfig} from './vcms';


const logger = new Logger('server');


export async function startServer(configFilepath?: string): Promise<void> {
  logger.log('Initialising server...');

  const config: VcmsOptions = await getConfig(configFilepath);

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
    logger.success(`Listening on port ${config.PORT}`);
  });

  server.on('error', async (e) => {
    logger.error(e.message);
    process.exit(1);
  });
}
