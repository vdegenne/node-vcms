import * as compression from 'compression';
import * as express from 'express';
import { Router } from 'express';

import { VcmsOptions } from '../config';
import { Logger } from '../logging';
import { Session } from '../redis-session';

const logger = new Logger('app');



export async function getApp(
  config: VcmsOptions, session?: Session): Promise<express.Application> {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(compression());

  // session, before anything else
  if (session) {
    if (session.middleware) {
      app.use(session.middleware);
    }

    // Session Initialisation Function
    if (session.initSessionFunction) {
      app.use((req, res, next) => {
        session.initSessionFunction(req.session);
        next();
      });
    }
  }


  // morgan
  if (config.node_env !== 'test') {
    app.use(require('morgan')('dev'));
  }

  // ping
  app.get('/ping', async (req, res) => res.send('pong\n'));


  // register middlewares
  if (config.middlewares) {
    for (const mw of config.middlewares) {
      logger.log(`Registering middleware ${mw}`);
      app.use(mw);
    }
  }

  // routers
  for (const base in config.routers) {
    logger.log(`Providing route "${base}"`);
    app.use(base, config.routers[base]);
  }

  // static (singular)
  if (config.static) {
    logger.log(`Registering static directory : "/" => "${config.static}"`);
    app.use(express.static(process.cwd() + '/' + config.static));
  }

  // statics (plural)
  if (config.statics && Object.keys(config.statics).length) {
    for (const s of config.statics) {
      logger.log(`Registering static directory : "${s.route}" => "${s.serve}"`);
      app.use(s.route, express.static(process.cwd() + '/' + s.serve));
    }
  }

  return app;
}


// make Router available in the vcms namespace
export { Router };
