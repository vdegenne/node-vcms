import {expect} from 'chai';
import {dirname} from 'path';

import {getConfig} from '../config';
import {displayAllLoggers} from '../logging';


const configFilepath = process.cwd() + '/fixtures/.vcms.yml';

suite('Config', () => {
  const debug = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });

  const run = async (args: any, configFilepath?: string) => {
    // save originals
    const originalArgv = process.argv;

    // change the execution context
    process.argv = ['node', 'app'].concat(args);

    // run update and get config
    const config = await getConfig(configFilepath);

    // get back to the original context
    process.argv = originalArgv;

    // return the result
    return config;
  };

  test('defaults', async () => {
    const config = await run([]);
    expect(config.PORT).to.equal(8000);
  });

  test('change port', async () => {
    const config = await run(['-p', '123']);
    expect(config.PORT).to.equal(123);
  });

  test('config file takes precedence over defaults', async () => {
    // default port is 8000, the port in the file is 8080 for dev
    const config = await run([], configFilepath);
    expect(config.PORT).to.equal(8080);
  });


  test('process.env takes precedence over config file', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321l

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await run([], configFilepath);
    expect(config.PORT).to.equal(321);

    if (!originalEnvPort) delete process.env.PORT;  // restore context
  });


  test('command line takes precedence over process.env', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321, command line option is 4444

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await run(['-p', '4444'], configFilepath);
    expect(config.PORT).to.equal(4444);


    // restore context
    if (!originalEnvPort)
      delete process.env.PORT;
    else
      process.env.PORT = originalEnvPort;
  });

  test('process.env.NODE_ENV influences the configuration', async () => {
    const originalNODE_ENV = process.env.NODE_ENV;  // save context
    process.env.NODE_ENV = 'dev';                   // change context

    // dev port is 3001
    let config = await run([], configFilepath);
    expect(config.PORT).to.equal(3001);


    process.env.NODE_ENV = 'prod';  // change context
    // prod port is 8080
    config = (await run([], configFilepath));
    expect(config.PORT).to.equal(8080);

    process.env.NODE_ENV = originalNODE_ENV;  // restore context
  });



  let TITLE =
      'process.env.NODE_ENV influenced configuration takes precedence over node-env influenced configuration';
  test(TITLE, async () => {
    // make sure NODE_ENV influences the configuration
    const originalNodeEnv = process.env.NODE_ENV;  // save context
    process.env.NODE_ENV = 'prod';                 // change context


    // the default file has a "dev" node-env with port 3001
    // but NODE_ENV is "prod" and "prod" node-env has 8080 port
    let config = await run([], configFilepath);
    expect(config.PORT).to.equal(8080);

    // restore context
    if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
  });


  test('changing the public directory', async () => {
    let config = await run(['--public-directory', 'hello'], configFilepath);
    expect(config.publicDirectory).to.equal('hello');
  });
});
