'use strict'

const noop = () => {}

const logger = { info: console.log, debug: console.debug, error: console.error }

if (process.env.NODE_ENV === 'production') {
  logger.info = noop
  logger.debug = noop
}

module.exports = logger
