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
  switch (config.db_type) {
    case 'pg':
      knexDialect = 'pg';
  }


  if (!config.db_user) {
    const error = 'No Database User specified !';
    logger.error(error);
    throw new Error(error);
  }


  /* PASSWORD */
  let password = config.db_password;
  if (!config.db_password) {
    password = question(
        `Enter Database password for ${config.db_user}: `,
        {hideEchoBack: true});
  }

  // if the password in the configuration file is a hash
  if (password.substr(0, 5) === '{SHA}') {
    logger.error('The password in the configuration file is encrypted.');

    password = question(
        `Enter Database password for ${config.db_user}: `,
        {hideEchoBack: true});

    const sha1 = createHash('sha1');
    sha1.update(password);

    if (sha1.digest('hex') !== config.db_password.substr(5)) {
      const err = new Error('Password for database is incorrect');
      err.name = 'database';
      throw err;
    }
  }


  /* DATABASE NAME */
  let dbname = config.db_name;
  if (!dbname) {
    logger.info(`No Database Name specified, using default (resolved to ${
        config.db_user})`);
    dbname = config.db_user;
  }

  // database
  const database = Knex({
    client: knexDialect,
    connection: {
      host: config.db_host,
      port: config.db_port,
      user: config.db_user,
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
