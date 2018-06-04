import {Transaction} from 'objection';

import {CreamModel, RelationMappings} from '../vcms';

import Role from './Role';


class User extends CreamModel {
  id!: number;
  username!: string;
  firstname!: string;
  lastname!: string;
  email!: string;
  password!: string;

  logged!: boolean;

  roles?: Role[];

  static tableName = 'users';
  static relationMappings: RelationMappings = {
    roles: {
      relation: CreamModel.ManyToManyRelation,
      modelClass: `${__dirname}/Role`,
      join: {from: 'users.id', through: {from: 'users_roles.user_id', to: 'users_roles.role_id'}, to: 'roles.id'}
    }
  }

  static jsonSchema = {
    type: 'object',
    required: ['username', 'firstname', 'lastname', 'email', 'password'],

    properties: {
      id: {type: 'integer'},
      username: {type: 'string'},
      firstname: {type: 'string'},
      lastname: {type: 'string'},
      email: {type: 'string'},
      password: {type: 'string'}
    }
  }

  /* helpers */
  async verifyExistence() {
    if (!this.id) {
      return false;
    }
    const user = await User.get(this.id);
    return (user ? true : false);
  }

  async hasRole(role: string) {
    let r: Role|any;
    for (r of this.roles) {
      if (typeof r === 'string' && r === role) {
        return true;
      }
      if (typeof r === 'object' && r.name === role) {
        return true;
      }
    }
    return false;
  }

  /* getters */
  static get = async (id: number, eager: string = '') => {
    return (await User.query().where('id', id).eager(eager))[0];
  };

  static getByUsername = async (username: string, eager: string = '') => {
    return (await User.query().where('username', username).eager(eager))[0];
  };
}


export default User;
