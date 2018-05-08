import {CreamModel, RelationMappings} from './objection-cream';


class Role extends CreamModel {
  id!: number;
  name!: string;

  static tableName = 'roles';

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
}


export default Role;
