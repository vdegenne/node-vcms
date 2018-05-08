import * as express from 'express';

import {env} from '../env';

import {userRouter} from './user.router';


const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

(async () => {
  // session middleware before all
  if (env.ENABLE_SESSION) {
    try {
      const {session} = require('../session');
      app.use(await session);
      app.use((req, res, next) => {
        /* Init the session here */
        if (!req.session.user) {
          req.session.user = { name: 'guest', roles: ['GUEST'] }
        }
        next();
      })
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  }

  // morgan
  env.NODE_ENV !== 'test' && app.use(require('morgan')('dev'));
  // ping
  app.get('/ping', async (req, res) => res.end('pong\n'));

  // routers
  app.use('/user', userRouter);
  // app.use('/customers', customerRouter);
})();


export default app;
