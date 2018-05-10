const loggers: Logger[] = [];


export class Logger {
  private name!: string;

  private display: boolean;

  constructor(name: string) {
    this.name = name;


    if (process.env.LOGGERS) {
      this.display = parseInt(process.env.LOGGERS) ? true : false;
    } else {
      this.display = true;
    }


    loggers.push(this);
  }


  log(message: string) {
    if (this.display) console.info(`[\x1b[36m${this.name}\x1b[0m]`, message);
  }

  info(message: string) {
    if (this.display)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[34m${message}\x1b[0m`);
  }

  error(message: string) {
    if (this.display)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[31m${message}\x1b[0m`);
  }

  success(message: string) {
    if (this.display)
      console.info(
          `[\x1b[36m${this.name}\x1b[0m]`, `\x1b[32m${message}\x1b[0m`);
  }

  setdisplay(display: boolean = false) {
    this.display = display;
  }
}


export function displayAllLoggers(display: boolean = true) {
  for (const l of loggers) {
    l.setdisplay(display);
  }
}
