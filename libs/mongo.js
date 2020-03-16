'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

async function init (config) {
  mongoose.connection.on('error', err => {
    console.error(err)
    process.exit(0)
  })

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination')
      process.exit(0)
    })
  })
  return mongoose.connect(config.url, config.options)
}

module.exports = init
