import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


import {getConfig as _getConfig, VcmsOptions} from '../config';
import {getDatabase} from '../database';
import {displayAllLoggers} from '../logging';
import Test from './models/Test';


chai.use(chaiAsPromised);
const assert = chai.assert;

const configFilepath = process.cwd() + '/fixtures/.vcms-db.yml';


suite('Database', async () => {
  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });

  async function getConfig(
      configFilepath: string, args: string[]): Promise<VcmsOptions> {
    // save originals
    const originalArgv = process.argv;

    // change the execution context
    process.argv = ['node', 'app'].concat(args);

    // run update
    const config = await _getConfig(configFilepath);

    // get back to the original context
    process.argv = originalArgv;

    return config;
  };



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



  let TEST = 'It connects to the local database and returns a Knex object';
  test(TEST, async () => {
    // with defaults
    const config = await getConfig(configFilepath, []);

    return expect(basicRun(config)).not.to.be.rejected;
  });


  TEST = 'Failing the connection with the database returns an Error';
  test(TEST, async () => {
    // fake port
    const config = await getConfig(configFilepath, ['--db-port', '1234']);

    return expect(basicRun(config)).to.be.rejected;
  });


  TEST = 'A wrong configuration returns an appropriate Error';
  test(TEST, async () => {
    // fake user
    const config = await getConfig(configFilepath, ['--db-user', 'fakeUser']);

    return expect(basicRun(config))
        .to.be.rejectedWith(
            /password authentication failed for user "fakeUser"/);
  });


  TEST = 'A successful connection "activate" the models';
  test(TEST, async () => {
    // with defaults
    const config = await getConfig(configFilepath, []);

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
