import * as commandLineArgs from 'command-line-args';
import commandArgs from './args';


export interface VcmsOptions {
  readonly PORT: number;
  readonly DATABASE: boolean;
  readonly SESSION: boolean;
  readonly NODE_ENV: string;
  readonly PG_HOST: string;
  readonly REDIS_HOST: string;
}



// NODE_ENV
let NODE_ENV: string = 'prod';
if (process.env.NODE_ENV &&
    ['test', 'dev', 'prod'].includes(process.env.NODE_ENV)) {
  NODE_ENV = process.env.NODE_ENV;
}

// PG_HOST
let PG_HOST: string = 'localhost';
if (process.env.PG_HOST) {
  if (process.env.PG_HOST === 'DOCKER_HOST') {
    if (!process.env.DOCKER_HOST) {
      throw new Error('DOCKER_HOST is not defined.');
    }
    PG_HOST = process.env.DOCKER_HOST
  } else {
    PG_HOST = process.env.PG_HOST;
  }
}

// REDIS_HOST
let REDIS_HOST: string = 'localhost';
if (process.env.REDIS_HOST) {
  if (process.env.REDIS_HOST === 'DOCKER_HOST') {
    if (!process.env.DOCKER_HOST) {
      throw new Error('DOCKER_HOST is not defined.');
    }
    REDIS_HOST = process.env.DOCKER_HOST
  } else {
    REDIS_HOST = process.env.REDIS_HOST;
  }
}


/** COMMAND-LINE ARGUMENTS */
const PORT = 8000;
let ENABLE_SESSION = false;

if (NODE_ENV !== 'test') {
  const args = commandLineArgs(commandArgs);
  // PORT = args.port;
  ENABLE_SESSION = args['enable-session'];
}


export const env: VcmsOptions = {
  PORT: PORT,
  ENABLE_SESSION: ENABLE_SESSION,
  NODE_ENV: NODE_ENV,
  PG_HOST: PG_HOST,
  REDIS_HOST: REDIS_HOST
}
