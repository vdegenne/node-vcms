import {readFileSync} from 'fs';
import * as Knex from 'knex';

import {getConfig as _getConfig, VcmsOptions} from '../config';
import Role from '../models/Role';
import {destroyStructure, getStructure, Structure} from '../server';

export async function getConfig(
    args: string[] = [],
    startupConfigPath: string = null,
    vcmsFilepath: string = null): Promise<VcmsOptions> {
  /* save the context */
  const originalArgv = process.argv;
  const originalNODE_ENV = process.env.NODE_ENV;

  /* set new context */
  process.argv = ['node', 'app'].concat(args);
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }

  const config = await _getConfig(startupConfigPath, vcmsFilepath);


  /* restore original context */
  process.argv = originalArgv;

  if (!originalNODE_ENV) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNODE_ENV;
  }

  return config;
}



export async function resetDatabase(database: Knex, scripts: string[]) {
  const sql =
      scripts
          .map(f => readFileSync(`${__dirname}/../../sql/${f}.sql`).toString())
          .join(';');

  await database.raw(sql);
}


export async function accessAsGuest(struct: Structure) {
  struct.config.middlewares = [(req, res, next) => {
    req.session.user.logged = false;
    req.session.user.roles = [new Role('GUEST')];
    next();
  }];

  // closing connections before making a new structure
  await destroyStructure(struct);
  struct = await getStructure(struct.config);
  return struct;
}


export async function accessAsUser(id: number = 1, struct: Structure) {
  struct.config.middlewares = [(req, res, next) => {
    req.session.user.logged = true;
    req.session.user.roles = [new Role('USER')];
    req.session.user.id = id;
    next();
  }];

  // closing connections before making a new structure
  await destroyStructure(struct);
  struct = await getStructure(struct.config);
  return struct;
}


export async function accessAsAdmin(struct: Structure) {
  struct.config.middlewares = [(req, res, next) => {
    req.session.user.logged = true;
    req.session.user.roles = [new Role('USER'), new Role('ADMIN')];
    req.session.user.id = 1414;  // fake id
    next();
  }];

  // closing connections before making a new structure
  await destroyStructure(struct);
  struct = await getStructure(struct.config);
  return struct;
}
