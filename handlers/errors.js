'use strict'

const logger = require('../libs/logger')

function errors (err, req, res, next) {
  logger.error('Something went wrong: ' + err.toString())
  logger.error(err.stack)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({ message: 'Something went wrong' })
}

module.exports = errors
