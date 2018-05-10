import {expect} from 'chai';


import {getConfig} from '../config';
import {displayAllLoggersInTests} from '../logging';
import {getRedisClient, getSessionMiddleware} from '../session';



suite('SessionMiddleware', () => {
  teardown(async () => {
    await run([]);  // force defaults
  });

  const run = async (args: any, configFilepath?: string) => {
    // save originals
    const originalArgv = process.argv;

    // change the execution context
    process.argv = ['node', 'app'].concat(args);

    // run update
    await getConfig(true, configFilepath);

    // get back to the original context
    process.argv = originalArgv;
  };

  let title = 'trying to connect to a non-existent redis host throw an error';
  test(title, async () => {
    await run(['--redis-host', 'localhost:6300']);
    expect(getSessionMiddleware()).to.be.rejectedWith(Error);
  });

  title = 'connecting to an existent redis host returns a session middleware';
  test(title, async () => {
    // use the defaults
    expect(getSessionMiddleware()).not.to.be.rejectedWith(Error);

    const mw = await getSessionMiddleware();
    expect(mw).to.be.a('Function');


    if (mw) {
      (await getRedisClient()).quit();
    }
  });
});


displayAllLoggersInTests(false);
