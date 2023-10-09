import chalk from 'chalk'
import moment from 'moment'

/**
 * Prints a log message with a timestamp and the specified method (log level).
 * @param {string} method - The log level (e.g., INFO, ERROR, WARN, etc.).
 * @param {string} input - The message to be logged.
 */
const log = (method, input) => {
  const timestamp = moment().format('DD/MM/YYYY HH:mm:ss Z')
  process.stdout.write(`[${timestamp}] | ${printMethod(method)} > ${input}\n`)
}

/**
 * Returns the log level decorated with the appropriate background color.
 * @param {string} method - The log level to be decorated.
 * @returns {string} The decorated log level.
 */
const printMethod = (method) => {
  const methods = {
    INFO: chalk.bgCyan.black,
    ERROR: chalk.bgRed.black,
    WARN: chalk.bgYellow.black,
    INIT: chalk.bgGreen.black,
    DEBUG: chalk.bgMagenta.black
  }

  return (methods[method] || (text => text))(method)
}

export default {
  info: (input) => log('INFO', input),
  error: (input) => log('ERROR', input),
  warn: (input) => log('WARN', input),
  init: (input) => log('INIT', input),
  debug: (input) => log('DEBUG', input)
}
