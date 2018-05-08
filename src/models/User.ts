import {CreamModel, RelationMappings} from './objection-cream';
import Role from './Role';


class User extends CreamModel {
  id!: number;
  username!: string;
  firstname!: string;
  lastname!: string;
  email!: string;
  readonly password!: string;

  roles?: Role[];

  static tableName = 'users';
  static relationMappings: RelationMappings = {
    roles: {
      relation: CreamModel.ManyToManyRelation,
      modelClass: `${__dirname}/Role`,
      join: {
        from: 'users.id',
        through: {from: 'users_roles.user_id', to: 'users_roles.role_id'},
        to: 'roles.id'
      }
    }
  }
}

export default User;
