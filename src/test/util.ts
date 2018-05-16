import {getConfig as _getConfig, VcmsOptions} from '../config';


export async function getConfig(
    args: string[] = [], startupConfigPath: string = null,
    vcmsFilepath: string = null): Promise<VcmsOptions> {
  /* save the context */
  const originalArgv = process.argv;
  const originalNODE_ENV = process.env.NODE_ENV;

  /* set new context */
  process.argv = ['node', 'app'].concat(args);
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }

  const config = await _getConfig(startupConfigPath, vcmsFilepath);


  /* restore original context */
  process.argv = originalArgv;

  if (!originalNODE_ENV) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNODE_ENV;
  }

  return config;
}
