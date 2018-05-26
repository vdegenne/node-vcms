import * as chai from 'chai';
import * as supertest from 'supertest';

import {VcmsOptions} from '../config';
import {displayAllLoggers} from '../logging';
import {destroyStructure, getStructure, Structure} from '../server';

import {getConfig} from './util';

const expect = chai.expect;

const defaultStartupScriptPath = __dirname + '/../../test/app/startupconfig.js';

suite('App', () => {
  let config: VcmsOptions;
  let structure: Structure;

  const debug = () => displayAllLoggers();

  setup(async () => {
    config = await getConfig([], defaultStartupScriptPath);
    console.log(config);
    structure = await getStructure(config);
  });

  teardown(async () => {
    displayAllLoggers(false);
    await destroyStructure(structure);
  });

  test('GET /api/hello returns "hello world"', async () => {
    return supertest(structure.app)
        .get('/api/hello')
        .expect(200, 'hello world');
  });

  test('publics get redirected to trailing-slash version', async () => {
    await supertest(structure.app)
        .get('/statics')
        .expect(301)
        .expect((res: supertest.Response) => {
          expect(res.header['location']).to.be.ok;
          expect(res.header['location']).to.equal('/statics/');
        });
  });

  test('can register multiple publics', async () => {
    await supertest(structure.app).get('/statics/').expect(200, /!doctype/);
    await supertest(structure.app).get('/hello/').expect(200, /!doctype/);
  });
});
