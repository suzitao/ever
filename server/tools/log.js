import log4js from 'log4js'

const logger = log4js.getLogger()
logger.level = process.env.NODE_ENV !== 'production' ? 'debug' : 'info'

console.debug = function () { logger.debug(argumentsToString(arguments)) }
console.info = function () { logger.info(argumentsToString(arguments)) }
console.warn = function () { logger.warn(argumentsToString(arguments)) }
console.error = function () { logger.error(argumentsToString(arguments)) }
console.log = function () { logger.info(argumentsToString(arguments)) }

const argumentsToString = function (ags) {
    let log = ''
    for (let ag of ags) {
        log += ag
        log += '  '
    }
    return log
}

export default logger
