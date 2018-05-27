import {StartupFunction} from '../../config';

const config: StartupFunction = async (config) => {
  switch (config.node_env) {
    case 'test':
      config.static = 'public';
      config.statics = [{route: /\/test/, serve: 'test'}];
  }
  return config;
};

export default config;
