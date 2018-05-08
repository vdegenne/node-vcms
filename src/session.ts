import * as connect from 'connect-redis';
import {RequestHandler} from 'express';
import * as Session from 'express-session';
import {createClient} from 'redis';

import {env} from './env';

const RedisStore = connect(Session);

let resolve: any, reject: any;
let session: Promise<RequestHandler> = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// client
const client = createClient({host: env.REDIS_HOST, port: 6379});

// on error
client.on('error', (err: Error) => reject(err));

// on success
client.on('ready', () => {
  console.info('The session handler is ready.');
  resolve(Session({
    store: new RedisStore({client: client}),
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: env.NODE_ENV === 'prod' ? '.vdegenne.com' : '.vdegenne.local'
    }
  }));
});


export {session};
