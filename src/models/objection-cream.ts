import {Model} from 'objection';

export class CreamModel extends Model {
  static async count() {
    const count: any = await this.query().count();
    return parseInt(count[0].count);
  }
};
