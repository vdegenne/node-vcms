import {Model} from 'objection';
// import database from '../database';


export class CreamModel extends Model {
  static async count() {
    const count: any = await this.query().count();
    return parseInt(count[0].count);
  }
}

export {RelationMappings} from 'objection';

// config
// Model.knex(database);
