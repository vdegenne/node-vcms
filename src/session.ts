import * as connect from 'connect-redis';
import {RequestHandler} from 'express';
import {Express} from 'express';
import * as Session from 'express-session';
import {createClient, RedisClient} from 'redis';

import {getConfig, VcmsOptions} from './config';
import {getLogger} from './logging';


const logger = getLogger('session');

let _client: RedisClient = undefined;


export async function getRedisClient(): Promise<RedisClient> {
  return new Promise<RedisClient>(async (resolve, reject) => {
    if (!_client) {
      const config = await getConfig();

      const redisHost = config.REDIS_HOST.split(':');
      const client = createClient({
        host: redisHost[0],
        port: redisHost[1] ? parseInt(redisHost[1]) : 6379
      });
      client.on('error', (e) => {
        client.quit();
        reject(e);
      });
      client.on('end', () => {
        logger.info('redis client has closed');
      });
      client.on('ready', () => {
        _client = client;
        resolve(client);
      });
    } else {
      resolve(_client);
    }
  });
}

export async function getSessionMiddleware(): Promise<RequestHandler> {
  const config = await getConfig();
  const RedisStore = connect(Session);

  let client: RedisClient;
  try {
    client = await getRedisClient();
  } catch (e) {
    throw e;
  }

  logger.info('connected to redis.');
  const session = Session({
    store: new RedisStore({client: client}),
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: config.NODE_ENV === 'prod' ? '.vdegenne.com' : '.vdegenne.local'
    }
  });

  return session;
};


let initSessionFunction: (session: Express.Session) => void = undefined;

export async function registerInitSessionFunction(
    fct: (session: Express.Session) => void): Promise<void> {
  initSessionFunction = fct;
}

export async function getInitSessionFunction():
    Promise<(session: Express.Session) => void> {
  return initSessionFunction;
}
