import * as Knex from 'knex';
import {getConfig} from './config';
import {Logger} from './logging';

const logger = new Logger('database');

let database: Knex = undefined;

export async function getDatabase(): Promise<Knex> {
  if (!database) {
    logger.info('initialising database...');
    let driver: string, knexDialect: string, url: string;

    const config = await getConfig();

    // specific options
    switch (config.DB_TYPE) {
      case 'pg':
        driver = 'postgres';
        knexDialect = 'pg';
    }


    if (!config.DB_USER) {
      const error = 'missing DB_USER property!');
      logger.error(error);
      throw new Error(error);
    } else if (!config.DB_PASSWORD) {
      const error = 'missing DB_PASSWORD property!';
      logger.error(error);
      throw new Error(error);
    }


    // construct the database url
    url += `${driver}://`;                             // driver
    url += `${config.DB_USER}:${config.DB_PASSWORD}`;  // ident
    url += `@${config.DB_HOST}:${config.DB_PORT}`;     // host
    url += `/${config.DB_NAME}`;                       // database


    database = Knex({client: knexDialect, connection: url});
  }

  return database;
}
