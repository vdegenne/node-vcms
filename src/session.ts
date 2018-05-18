import {RequestHandler} from 'express';
import {RedisClient} from 'redis';

export interface Session {
  readonly type: string;
  readonly connection: RedisClient; /* todo: implement more providers */
  readonly middleware: RequestHandler;
  readonly initSessionFunction: (session: Express.Session) => void;
}
