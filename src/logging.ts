
const loggers: Logger[] = [];


export class Logger {
  private name!: string;
  private config!: any;

  private displayInTests: boolean;

  constructor(name: string) {
    this.name = name;
    this.displayInTests = false;

    loggers.push(this);
  }

  info(message: string) {
    if (process.env.NODE_ENV !== 'test' || this.displayInTests)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[32m${message}\x1b[0m`);
  }

  error(message: string) {
    if (process.env.NODE_ENV !== 'test' || this.displayInTests)
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
