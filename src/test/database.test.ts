import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import {getConfig, VcmsOptions} from '../config';
import {getDatabase} from '../database';
import {displayAllLoggersInTests} from '../logging';

chai.use(chaiAsPromised);
const assert = chai.assert;


suite('Database', async () => {
  const debug = () => {
    displayAllLoggersInTests();
  };

  suiteTeardown(() => {
    displayAllLoggersInTests(false);
  });

  teardown(async () => {
    await run([]);  // force defaults
  });

  const run =
      async(args: any, configFilepath?: string): Promise<VcmsOptions> => {
    // save originals
    const originalArgv = process.argv;

    // change the execution context
    process.argv = ['node', 'app'].concat(args);

    // run update
    const config = await getConfig(true, configFilepath);

    // get back to the original context
    process.argv = originalArgv;

    return config;
  };

  let title = 'Failing the connection with the database returns an Error';
  test(title, async () => {
    const config = await run([], process.cwd() + '/fixtures/.vcms-db.yml');
    console.log(config);
    expect(getDatabase(config)).to.be.rejectedWith(Error);
  });


  title = 'It connects to the local database and returns a Knex object';
  test(title, async () => {
    // run with the default (see "teardown" function)
    const config = await run(['--db-port', '1234']);
    expect(getDatabase(config)).not.to.be.rejectedWith(Error);
  });
});
