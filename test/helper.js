'use strict'

const request = require('supertest')

const config = require('../config')

config.mongo.url = 'mongodb://localhost/ta_li_fc-test'
config.cache.limit = 3

const init = require('../app')

async function build (t) {
  const app = await init()
  t.tearDown(() => require('mongoose').connection.close())
  return request(app)
}

module.exports = {
  build
}
