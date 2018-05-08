import * as Knex from 'knex';
import {env} from './config';


let dburl = `postgres://testdbuser:password@${env.DB_HOST}:5432/pizzajerry`;

const database = Knex({client: 'pg', connection: dburl});

export default database;
