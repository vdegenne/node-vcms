import {CreamModel, RelationMappings} from '../vcms';

class Role extends CreamModel {
  static tableName = 'roles';
  id!: number;
  name!: string;

  constructor(name: string) {
    super();
    this.name = name;
  }


  static relationMappings: RelationMappings = {
    users: {
      relation: CreamModel.ManyToManyRelation,
      modelClass: `${__dirname}/User`,
      join: {
        from: 'roles.id',
        through: {from: 'users_roles.role_id', to: 'users_roles.user_id'},
        to: 'users.id'
      }
    }
  }

  static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {id: {type: 'integer'}, name: {type: 'string'}}
  }

  static get = async (id: number, eager: string = '') => {
    return await Role.query().findById(id).eager(eager);
  };
}


export default Role;
