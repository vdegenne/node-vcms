import {StartupFunction} from '../../config';

const config: StartupFunction = async (config) => {
  switch (config.node_env) {
    case 'prod':
      config.db_host = 'localhost';
  }
  return config;
};

export default config;
