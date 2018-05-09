import * as express from 'express';

import {getConfig} from '../config';
import {getInitSessionFunction, getSessionMiddleware} from '../session';

import {userRouter} from './user.router';



let app: express.Application = undefined;
const routers: {[base: string]: express.Router} = {};


export async function registerRouter(
    base: string, router: express.Router): Promise<void> {
  routers[base] = router;
  if (app) {
    app.use(base, router);
  }
}



export async function getApp(forceUpdate: boolean = false):
    Promise<express.Application> {
  if (!app || forceUpdate) {
    app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    const config = await getConfig();
    // use session before anything else
    if (config.SESSION_REQUIRED) {
      try {
        const sessionMiddleware = await getSessionMiddleware();
        const initSessionFunction = await getInitSessionFunction();
        app.use(sessionMiddleware);

        // Session Initialisation Function
        if (initSessionFunction) {
          app.use(async (req, res, next) => {
            await initSessionFunction(req.session);
            next();
          });
        }

      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    }


    // morgan
    if (config.NODE_ENV !== 'test') {
      app.use(require('morgan')('dev'));
    }

    // ping
    app.get('/ping', async (req, res) => res.send('pong\n'));

    // routers
    for (const base in routers) {
      app.use(base, routers[base]);
    }
  }

  return app;
}
