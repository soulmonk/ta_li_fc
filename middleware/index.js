'use strict'

function init (app) {
  app.use(require('./logger'))
  app.use(require('./body-parser'))
}

module.exports = init
