import * as Knex from 'knex';
import {question} from 'readline-sync';

import {getConfig, VcmsOptions} from './config';
import {Logger} from './logging';

const logger = new Logger('database');

let database: Knex = undefined;

export async function getDatabase(config: VcmsOptions): Promise<Knex> {
  if (!database) {
    logger.info('initialising database...');
    let driver: string, knexDialect: string, url: string;

    // const config = await getConfig();

    // specific options
    switch (config.DB_TYPE) {
      case 'pg':
        driver = 'postgres';
        knexDialect = 'pg';
    }


    if (!config.DB_USER) {
      const error = 'missing DB_USER property!';
      logger.error(error);
      throw new Error(error);
    } else if (!config.DB_PASSWORD) {
      const error = 'missing DB_PASSWORD property!';
      logger.error(error);
      throw new Error(error);
    }

    // is the password a digest ?
    let password = config.DB_PASSWORD;
    if (config.DB_PASSWORD.substr(0, 5) === '{SHA1}') {
      password = question('Enter Database Password: ', {hideEchoBack: true});
    }

    // construct the database url
    /*     url += `${driver}://`;                             // driver
        url += `${config.DB_USER}:${config.DB_PASSWORD}`;  // ident
        url += `@${config.DB_HOST}:${config.DB_PORT}`;     // host
        url += `/${config.DB_NAME}`;                       // database */


    database = Knex({
      client: knexDialect,
      connection: {
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: password,
        database: config.DB_NAME,
      },
      pool: {
        min: 0,
        max: 1,
        afterCreate: function(conn: any, done: any) {
          logger.info('a new pool was created');
          done();
        }
      }
    });


    // we should test the connection now
    try {
      await testConnection();
    } catch (e) {
      logger.error(e.message);
      throw e;
    }
  }

  return database;
}


export async function testConnection(): Promise<Error|void> {
  try {
    await database.raw('select 1+1 as result');
  } catch (e) {
    throw new Error(e.message);
  }
}
