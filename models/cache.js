'use strict'

const mongoose = require('mongoose')

const CacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },

  value: {
    type: String,
    required: true
  },

  ttl: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('Cache', CacheSchema)
