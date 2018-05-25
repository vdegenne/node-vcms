import * as compression from 'compression';
import * as express from 'express';
import {Router} from 'express';

import {getConfig, VcmsOptions} from '../config';
import {Logger} from '../logging';
import {getSession, Session} from '../redis-session';

const logger = new Logger('app');


export type Routers = {
  [base: string]: Router
};


export async function getApp(
    config: VcmsOptions, session?: Session): Promise<express.Application> {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

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

  // publics
  if (config.publics && Object.keys(config.publics).length) {
    for (const p of config.publics) {
      logger.log(`Using public directory : "${p.route}" => "${p.serve}"`);
      app.use(p.route, express.static(process.cwd() + '/' + p.serve));
    }
  }

  return app;
}


// make Router available in the vcms namespace
export {Router};
