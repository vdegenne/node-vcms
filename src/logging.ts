import {VcmsOptions} from './config';
import {getConfig} from './vcms';


const loggers: Logger[] = [];


export class Logger {
  private name!: string;
  private config!: VcmsOptions;

  private displayInTests: boolean = false;

  constructor(name: string) {
    this.name = name;

    getConfig().then(c => {
      this.config = c;
    });
    loggers.push(this);
  }

  info(message: string) {
    if (this.displayInTests)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[32m${message}\x1b[0m`);
  }

  error(message: string) {
    if (this.displayInTests)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[31m${message}\x1b[0m`);
  }

  setDisplayInTests(display: boolean = false) {
    this.displayInTests = display;
  }
}


export function displayAllLoggersInTests(display: boolean = true) {
  for (const l of loggers) {
    l.setDisplayInTests(display);
  }
}
