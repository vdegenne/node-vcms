import * as connect from 'connect-redis';
import {RequestHandler} from 'express';
import * as Session from 'express-session';
import {createClient, RedisClient} from 'redis';

import {getConfig, VcmsOptions} from './config';
import {Logger} from './logging';

const logger = new Logger('session');

export interface Session {
  redis: RedisClient, middleware: RequestHandler
}


export async function getSession(config: VcmsOptions): Promise<Session> {
  const RedisStore = connect(Session);

  let redis: RedisClient;
  try {
    redis = await getRedisClient(config);
  } catch (e) {
    throw e;
  }

  logger.info('connected to redis.');
  const middleware = Session({
    store: new RedisStore({client: redis}),
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: config.NODE_ENV === 'prod' ? '.vdegenne.com' : '.vdegenne.local'
    }
  });

  return {redis, middleware};
};



function getRedisClient(config: VcmsOptions): Promise<RedisClient> {
  return new Promise((resolve, reject) => {
    const redisHost = config.REDIS_HOST.split(':');
    const client = createClient({
      host: redisHost[0],
      port: redisHost[1] ? parseInt(redisHost[1]) : 6379
    });

    client
        .on('ready', () => resolve(client))

        .on('error', (e) => client.quit() && reject(e))
        .on('end', () => logger.info('redis client has closed'));
  });
}



let initSessionFunction: (session: Express.Session) => void = undefined;

export async function registerInitSessionFunction(
    fct: (session: Express.Session) => void): Promise<void> {
  initSessionFunction = fct;
}

export async function getInitSessionFunction():
    Promise<(session: Express.Session) => void> {
  return initSessionFunction;
}
