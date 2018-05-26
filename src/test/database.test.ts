import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import {VcmsOptions} from '../config';
import {getDatabase} from '../database';
import {displayAllLoggers} from '../logging';

import Test from './fixtures/Test';
import {getConfig} from './util';


chai.use(chaiAsPromised);
const assert = chai.assert;


const defaultConfigFilepath = __dirname + '/../../test/.vcms.yml';


suite('Database', async () => {
  let config: VcmsOptions;

  const debug = () => displayAllLoggers(false);

  setup(async () => {
    config = await getConfig([], null, defaultConfigFilepath);
  });

  teardown(() => {
    displayAllLoggers(false);
  });

  const basicRun = (config: VcmsOptions) => {
    return new Promise(async (resolve, reject) => {
      try {
        const database = await getDatabase(config);
        database.destroy();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };



  test(
      'It connects to the local database and returns a Knex object',
      async () => {
        return expect(basicRun(config)).not.to.be.rejected;
      });


  test(
      'Failing the connection with the database returns an Error', async () => {
        // fake port
        config =
            await getConfig(['--db-port', '1234'], null, defaultConfigFilepath);

        return expect(basicRun(config)).to.be.rejected;
      });



  test('A wrong configuration returns an appropriate Error', async () => {
    // fake user
    const config =
        await getConfig(['--db-user', 'fakeUser'], null, defaultConfigFilepath);

    return expect(basicRun(config))
        .to.be.rejectedWith(
            /password authentication failed for user "fakeUser"/);
  });



  test('A successful connection "activate" the models', async () => {
    // with defaults
    const config = await getConfig([], null, defaultConfigFilepath);

    const runTest = new Promise<Test[]>(async (resolve, reject) => {
      try {
        const database = await getDatabase(config);

        const results = await Test.query();
        database.destroy();

        resolve(results);
      } catch (e) {
        reject(e);
      }
    });

    expect(runTest).to.be.fulfilled;
    return runTest.then(r => expect(r.length).to.equal(2));
  });
});
