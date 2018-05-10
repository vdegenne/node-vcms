import {expect} from 'chai';

import {getConfig, update as updateConfig} from '../config';
import {getDatabase} from '../database';
import {displayAllLoggersInTests} from '../logging';



suite('Database', async () => {
  suiteSetup(() => {
    displayAllLoggersInTests();
  });
  suiteTeardown(() => {
    displayAllLoggersInTests(false);
  });
  teardown(() => {
    run([]);  // force defaults
  });

  const run = async (args: any, configFilepath?: string) => {
    // save originals
    const originalArgv = process.argv;

    // change the execution context
    process.argv = ['node', 'app'].concat(args);

    // run update
    await updateConfig(configFilepath);

    // get back to the original context
    process.argv = originalArgv;
  };


  test(
      'it connects to the local database and returns a Knex object',
      async () => {
        await run([], process.cwd() + '/fixtures/.vcms-db.yml');
        const database = await getDatabase();
      });
});
