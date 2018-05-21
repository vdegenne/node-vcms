import {expect} from 'chai';
import {dirname} from 'path';


import {displayAllLoggers} from '../logging';
import {getConfig} from './util';


const defaultConfigFilepath = __dirname + '/../../fixtures/.vcms.yml';
const defaultStartupConfigScriptFilepath = __dirname;


suite('Config', () => {
  const log = () => {
    displayAllLoggers();
  };

  suiteTeardown(() => {
    displayAllLoggers(false);
  });


  test('defaults', async () => {
    const config = await getConfig();
    expect(config.PORT).to.equal(8000);
    expect(config.publics).to.deep.equal({'/': 'public'});
  });

  test('change port', async () => {
    const config = await getConfig(['-p', '123']);
    expect(config.PORT).to.equal(123);
  });

  test('config file takes precedence over defaults', async () => {
    // default port is 8000, the port in the file is 8080 for dev
    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.PORT).to.equal(123);
  });


  test('process.env takes precedence over config file', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321l

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.PORT).to.equal(321);

    if (!originalEnvPort) delete process.env.PORT;  // restore context
  });


  test('command line takes precedence over process.env', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321, command line option is 4444

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await getConfig(['-p', '4444'], null, defaultConfigFilepath);
    expect(config.PORT).to.equal(4444);


    // restore context
    if (!originalEnvPort)
      delete process.env.PORT;
    else
      process.env.PORT = originalEnvPort;
  });

  test('process.env.NODE_ENV influences the configuration', async () => {
    const originalNODE_ENV = process.env.NODE_ENV;  // save context

    process.env.NODE_ENV = 'dev';  // change context
    // dev port is 3001
    let config = await getConfig([], null, defaultConfigFilepath);
    expect(config.PORT).to.equal(3001);


    process.env.NODE_ENV = 'prod';  // change context
    // prod port is 8080
    config = await getConfig([], null, defaultConfigFilepath);
    expect(config.PORT).to.equal(8080);

    // restore defaults
    if (!originalNODE_ENV) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNODE_ENV;
    }
  });

  test('publics is configurable from .vcms.yml file', async () => {
    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.publics)
        .to.deep.equal({'/': 'public', '/another-public': 'public2'});
  });
});
