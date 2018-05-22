import * as connect from 'connect-redis';
import * as ExpressSession from 'express-session';
import {createClient, RedisClient} from 'redis';

import {VcmsOptions} from './config';
import {Logger} from './logging';
import {Session} from './session';

const logger = new Logger('session');


export async function getSession(config: VcmsOptions): Promise<Session> {
  const RedisStore = connect(ExpressSession);

  let connection: RedisClient;
  try {
    connection = await getRedisClient(config);
  } catch (e) {
    throw e;
  }


  logger.success('Connected to redis.');

  const sessionOptions: ExpressSession.SessionOptions = {
    store: new RedisStore({client: connection}),
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
        'No session Cookie Domain set. It will use the whole url address (e.g. "www.example.com") provided by the requests.');
  }

  const middleware = ExpressSession(sessionOptions);


  return {
    type: 'redis',
    connection,
    middleware,
    initSessionFunction: config.initSessionFunction
  };
};



function getRedisClient(config: VcmsOptions): Promise<RedisClient> {
  return new Promise((resolve, reject) => {
    const connectionHost = config.REDIS_HOST.split(':');

    const client = createClient({
      host: connectionHost[0],
      port: connectionHost[1] ? parseInt(connectionHost[1]) : 6379
    });

    client
        .on('ready', () => resolve(client))

        .on('error',
            (e) => {
              client.quit();
              reject(e);
            })
        .on('end', () => logger.info('redis client has closed'));
  });
}

export async function closeSession(Session: Session) {
  Session.connection.quit();
}


export {Session};
