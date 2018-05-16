import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import {VcmsOptions} from '../config';
import {displayAllLoggers} from '../logging';
import {getSession, Session} from '../session';

import {getConfig} from './util';


const expect = chai.expect;
chai.use(chaiAsPromised);


suite('SessionMiddleware', () => {
  let session: Session;

  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });

  teardown(() => {
    if (session) {
      session.redis.quit();
    }
  });


  let title;
  title = 'trying to connect to a non-existent redis host throw an error';
  test(title, async () => {
    const config =
        await getConfig(['--enable-session', '--redis-host', 'localhost:6300']);

    return expect(getSession(config)).to.be.rejectedWith(/ECONNREFUSED/);
  });


  title = 'connecting to an existent redis host returns a session middleware';
  test(title, async () => {
    const config = await getConfig(['--enable-session']);

    const runTest = getSession(config);
    session = await runTest;

    return expect(runTest).not.to.be.rejected;
  });
});
