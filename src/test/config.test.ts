import {expect} from 'chai';
import {dirname} from 'path';

import {VcmsOptions} from '../config';
import {displayAllLoggers} from '../logging';

import {getConfig} from './util';

const defaultConfigFilepath = __dirname + '/../../test/.vcms.yml';
const defaultStartupScriptPath = __dirname + '/../../test/app/startupconfig.js';


suite('Config', () => {
  let config: VcmsOptions;

  setup(async () => {
    config = await getConfig();
  });

  test('defaults', async () => {
    expect(config.port).to.equal(8000);
  });

  test('command-line arguments', async () => {
    config = await getConfig(['-p', '123']);
    expect(config.port).to.equal(123);
  });

  test('config file takes precedence over defaults', async () => {
    // default port is 8000, the port in the file is 8080 for dev
    config = await getConfig([], null, defaultConfigFilepath);
    expect(config.port).to.equal(123);
  });


  test('process.env takes precedence over config file', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.port).to.equal(321);

    if (!originalEnvPort)
      delete process.env.PORT;  // restore context
  });


  test('command line takes precedence over process.env', async () => {
    // default port is 8000, the port in the file is 123,
    // process.env.PORT is 321, command line option is 4444

    const originalEnvPort = process.env.PORT;  // save context
    process.env.PORT = '321';                  // change context

    const config = await getConfig(['-p', '4444'], null, defaultConfigFilepath);
    expect(config.port).to.equal(4444);


    // restore context
    if (!originalEnvPort)
      delete process.env.PORT;
    else
      process.env.PORT = originalEnvPort;
  });

  test('process.env.NODE_ENV influences the configuration', async () => {
    const originalNODE_ENV = process.env.NODE_ENV;  // save context

    process.env.NODE_ENV = 'prod';  // change context
    // prod port is 8080
    config = await getConfig([], null, defaultConfigFilepath);
    expect(config.port).to.equal(8080);

    // restore defaults
    if (!originalNODE_ENV) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNODE_ENV;
    }
  });

  test('publics is configurable from .vcms.yml file', async () => {
    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.publics[0]).to.deep.equal({route: '/', serve: 'public'});
  });

  test('RegExps in publics get converted', async () => {
    const config = await getConfig([], null, defaultConfigFilepath);
    expect(config.publics[1].route).to.be.a('regexp');
    expect(config.publics[1])
        .to.deep.equal({route: /\/test/, serve: 'public/test'});
  });
});


suite('Config from script', () => {
  let config: VcmsOptions;
  setup(async () => {
    config = await getConfig([], defaultStartupScriptPath);
  });

  test('publics is configurable from script and overrides static', async () => {
    expect(config.publics).to.deep.equal([
      {route: /\/hello/, serve: 'public/world'}
    ]);
  });
});
