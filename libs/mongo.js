'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

function init (config) {
  mongoose.connect(config.url, config.options)

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination')
      process.exit(0)
    })
  })
}

module.exports = init
