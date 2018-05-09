import {getConfig} from './vcms';


export let _inTestToo: boolean = false;


export function inTestToo(inTestToo: boolean) {
  _inTestToo = inTestToo;
}


export function getLogger(name: string) {
  return {
    info: async (message: string) => {
      if ((await getConfig()).NODE_ENV !== 'test' || _inTestToo)
        console.info(`[\x1b[36m${name}\x1b[0m]`, `\x1b[32m${message}\x1b[0m`);
    },

    error: async (message: string) => {
      if ((await getConfig()).NODE_ENV !== 'test' || _inTestToo)
        console.error(`[\x1b[36m${name}\x1b[0m]`, `\x1b[31m${message}\x1b[0m`);
    }
  };
}
