import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import {displayAllLoggers} from '../logging';
import {closeSession, getSession, Session} from '../redis-session';

import {getConfig} from './util';


const expect = chai.expect;
chai.use(chaiAsPromised);


suite('SessionMiddleware', () => {
  let Session: Session;

  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });


  teardown(() => {
    if (Session) {
      closeSession(Session);
      Session = null;
    }
  });


  test(
      'trying to connect to a non-existent redis host throw an error',
      async () => {
        const config = await getConfig(
            ['--enable-session', '--redis-host', 'localhost:6300']);

        return expect(getSession(config)).to.be.rejectedWith(/ECONNREFUSED/);
      });



  test(
      'connecting to an existent redis host returns a session middleware',
      async () => {
        const config = await getConfig(['--enable-session']);

        const runTest = getSession(config);
        Session = await runTest;

        return expect(runTest).not.to.be.rejected;
      });
});
