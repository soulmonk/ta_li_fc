'use strict'

const request = require('supertest')

const config = require('../config')

config.mongo.url = 'mongodb://localhost/ta_li_fc-test'

const init = require('../app')

function build (t) {
  const app = init()
  t.tearDown(() => require('mongoose').connection.close())
  return request(app)
}

module.exports = {
  build
}
