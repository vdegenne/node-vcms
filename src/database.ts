import * as Knex from 'knex';
import {env} from './env';


let dburl = `postgres://testdbuser:password@${env.PG_HOST}:5432/pizzajerry`;

const database = Knex({client: 'pg', connection: dburl});

export default database;
