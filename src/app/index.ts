import * as express from 'express';
import {Router} from 'express';

import {getConfig, VcmsOptions} from '../config';
import {Logger} from '../logging';
import {getSession} from '../session';


const logger = new Logger('app');


export type Routers = {
  [base: string]: Router
};


export async function getApp(config: VcmsOptions):
    Promise<express.Application> {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.use(express.static(process.cwd() + '/public'));


  // session, before anything else
  if (config.SESSION_REQUIRED) {
    let session;
    try {
      session = await getSession(config);
    } catch (e) {
      throw e;
    }

    app.use(session.middleware);

    // Session Initialisation Function
    if (config.initSessionFunction) {
      app.use(async (req, res, next) => {
        await config.initSessionFunction(req.session);
        next();
      });
    }
  }


  // morgan
  if (config.NODE_ENV !== 'test') {
    app.use(require('morgan')('dev'));
  }

  // ping
  app.get('/ping', async (req, res) => res.send('pong\n'));

  // routers
  for (const base in config.routers) {
    logger.log(`Providing route "${base}"`);
    app.use(base, config.routers[base]);
  }

  return app;
}


// make Router available in the vcms namespace
export {Router};
