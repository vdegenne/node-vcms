import {CreamModel} from '../../models/objection-cream';



class Test extends CreamModel {
  readonly id!: number;
  name!: string;

  static tableName = 'test_table';
}


export default Test;
