import * as connect from 'connect-redis';
import {RequestHandler} from 'express';
import * as Session from 'express-session';
import {createClient, RedisClient} from 'redis';

import {getConfig, VcmsOptions} from './config';
import {Logger} from './logging';

const logger = new Logger('session');

export interface Session {
  readonly redis: RedisClient, readonly middleware: RequestHandler
}


export async function getSession(config: VcmsOptions): Promise<Session> {
  const RedisStore = connect(Session);

  let redis: RedisClient;
  try {
    redis = await getRedisClient(config);
  } catch (e) {
    throw e;
  }


  logger.info('Connected to redis.');

  const sessionOptions: Session.SessionOptions = {
    store: new RedisStore({client: redis}),
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: false
  }

  if (config.SESSION_COOKIE_DOMAIN) {
    logger.log(
        `Using ${config.SESSION_COOKIE_DOMAIN} for the session cookie domain.`);
    sessionOptions.cookie = {};
    sessionOptions.cookie.domain = config.SESSION_COOKIE_DOMAIN;
  }
  else {
    logger.info(
        'No Session Cookie Domain set. It will use the whole url address (e.g. "www.example.com") provided by the requests.');
  }

  const middleware = Session(sessionOptions);

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

        .on('error',
            (e) => {
              client.quit();
              reject(e);
            })
        .on('end', (e) => logger.info('redis client has closed'));
  });
}
