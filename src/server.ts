import {createServer} from 'http';

import {getApp} from './app';
import {ConfigFileOptions, VcmsOptions} from './config';
// import {getLogger} from './logging';
import {getConfig} from './vcms';


// const logger = getLogger('server');


export async function startServer(configFilepath?: string): Promise<void> {
  let config: VcmsOptions;
  if (configFilepath) {
    config = await getConfig(true, configFilepath);
  } else {
    config = await getConfig();
  }
  const app = await getApp();
  const server = createServer(app);

  // logger.info('starting...');
  server.listen(
      config.PORT,
      () => {
          // logger.info(`Listening on port ${config.PORT}`);
      });

  server.on('error', async (e) => {
    // await logger.error(e.message);
    process.exit(1);
  });
}
