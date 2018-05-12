import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import {getConfig} from '../config';
import {displayAllLoggers} from '../logging';
import {getSession, Session} from '../session';


const expect = chai.expect;
chai.use(chaiAsPromised);


suite('SessionMiddleware', () => {
  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });


  const run = (configFilepath: string, args: string[]) => {
    return new Promise<Session>(async (resolve, reject) => {
      // save originals
      const originalArgv = process.argv;

      // change the execution context
      process.argv = ['node', 'app'].concat(args);

      // session specific test execution
      const config = await getConfig(configFilepath);
      let session;
      try {
        session = await getSession(config);
      } catch (e) {
        reject(e);
        return;
      }

      // get back to the original context
      process.argv = originalArgv;

      resolve(session);
    })
  };


  let title = 'trying to connect to a non-existent redis host throw an error';
  test(title, async () => {
    return expect(run(undefined,
                      ['--enable-session', '--redis-host', 'localhost:6300']))
        .to.be.rejected;
  });

  title = 'connecting to an existent redis host returns a session middleware';
  test(title, async () => {
    const runTest = run(undefined, ['--enable-session']);

    expect(runTest).not.to.be.rejected;

    const session = await runTest;
    expect(session.redis).to.be.ok;
    return session.redis.quit();
  });
});
