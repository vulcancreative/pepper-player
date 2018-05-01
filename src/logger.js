class Logger {
  log(statement = "\n") {
    console.log(statement);
  }
}

const logger = new Logger();

export { logger };
