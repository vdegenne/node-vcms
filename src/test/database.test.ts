import {expect} from 'chai';

import {update as updateConfig} from '../config';
import {getDatabase} from '../database';

suite('Database', async () => {
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


  test('it connects and returns a Knex object', async () => {
    await run(['--db-user'])
    const database = await getDatabase();
    try {
      return database.raw('select 1+1');
    } catch (e) {
      throw new Error('no connection');
    }
  });
});
