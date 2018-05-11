import {expect} from 'chai';


import {getConfig} from '../config';
import {displayAllLoggers} from '../logging';
import {getSession} from '../session';



suite('SessionMiddleware', () => {
  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });


  const run = async (configFilepath: string, args: string[]) => {
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
      throw e;
    }

    // close the redis connection
    session.redis.quit();


    // get back to the original context
    process.argv = originalArgv;

    console.log(config);
    return config;
  };


  let title = 'trying to connect to a non-existent redis host throw an error';
  test(title, async () => {
    expect(run(undefined, [
      '--enable-session', '--redis-host', 'localhost:6300'
    ])).to.be.rejectedWith(Error);
  });

  /*   title = 'connecting to an existent redis host returns a session
    middleware'; test(title, async () => {
      // use the defaults
      expect(getSessionMiddleware()).not.to.be.rejectedWith(Error);

      const mw = await getSessionMiddleware();
      expect(mw).to.be.a('Function');


      if (mw) {
        (await getRedisClient()).quit();
      }
    }); */
});
