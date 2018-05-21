import {createHash} from 'crypto';
import * as Knex from 'knex';
import {Model} from 'objection';
import {question} from 'readline-sync';

import {VcmsOptions} from './config';
import {Logger} from './logging';

const logger = new Logger('database');

export async function getDatabase(config: VcmsOptions): Promise<Knex> {
  logger.log('initialising database...');
  let knexDialect: string;

  // specific options
  switch (config.DB_TYPE) {
    case 'pg':
      knexDialect = 'pg';
  }


  if (!config.DB_USER) {
    const error = 'No Database User specified !';
    logger.error(error);
    throw new Error(error);
  }


  /* PASSWORD */
  let password = config.DB_PASSWORD;
  if (!config.DB_PASSWORD) {
    password = question(
        `Enter Database password for ${config.DB_USER}: `,
        {hideEchoBack: true});
  }

  // if the password in the configuration file is a hash
  if (password.substr(0, 5) === '{SHA}') {
    logger.error('The password in the configuration file is encrypted.');

    password = question(
        `Enter Database password for ${config.DB_USER}: `,
        {hideEchoBack: true});

    const sha1 = createHash('sha1');
    sha1.update(password);

    if (sha1.digest('hex') !== config.DB_PASSWORD.substr(5)) {
      const err = new Error('Password for database is incorrect');
      err.name = 'database';
      throw err;
    }
  }


  /* DATABASE NAME */
  let dbname = config.DB_NAME;
  if (!dbname) {
    logger.info(`No Database Name specified, using default (resolved to ${
        config.DB_USER})`);
    dbname = config.DB_USER;
  }

  // database
  const database = Knex({
    client: knexDialect,
    connection: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: password,
      database: dbname,
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


  // testing the connection now
  try {
    await testDatabaseConnection(database);
  } catch (e) {
    logger.error(e.message);
    throw e;
  }

  // this line makes new made models automatically be mapped to the database
  Model.knex(database);

  logger.success('Database ready.');
  return database;
}


export async function testDatabaseConnection(database: Knex):
    Promise<Error|void> {
  try {
    const r = await database.raw('select 1+1 as result');
  } catch (e) {
    throw new Error(e.message);
  }
}
