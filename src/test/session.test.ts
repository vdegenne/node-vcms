import {expect} from 'chai';
import {RequestHandler} from 'express';

import {getApp} from '../app';
import {getConfig, update as updateConfig} from '../config';
import {displayAllLoggersInTests} from '../logging';
import {getRedisClient, getSessionMiddleware} from '../session';


const configFilepath = process.cwd() + '/fixtures/.vcms.yml';


suite('SessionMiddleware', () => {
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

  let title = 'trying to connect to a non-existent redis host throw an error';
  test(title, (done) => {
    run(['--redis-host', 'localhost:6300']).then(async () => {
      try {
        await getSessionMiddleware();
        done('not expected');
      } catch (e) {
        done();
      }
    });
  });

  title = 'connecting to an existent redis host returns a session middleware';
  test(title, async () => {
    // use the defaults
    const middleware = await getSessionMiddleware();

    expect(typeof middleware).to.equal('function');


    (await getRedisClient()).quit();
  });
});


displayAllLoggersInTests(false);
