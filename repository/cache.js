'use strict'

const hyperid = require('hyperid')
const logger = require('../libs/logger')

class CacheRepository {
  constructor (model, cfg) {
    this.cfg = cfg
    this.model = model
  }

  async getAllKeys () {
    return this.model.find({}, '+key')
      .then(res => res.map(({ key }) => key))
  }

  async findOrCreate (key) {
    let model = await this.find(key)
    if (model && model.ttl < Date.now()) {
      logger.info('Cache expired, removing')
      await model.remove()
      model = false
    }
    if (model) {
      model.set('ttl', this.getTtl())
      await model.save()
      return model.value
    }
    const value = this.generateValue()
    await this.create(key, value)
    return value
  }

  getTtl () {
    return Date.now() + this.cfg.ttl * 1000
  }

  async update (key, value) {
    // todo update expired
    // todo upsert
    return this.model.updateOne({ key }, {
      key,
      value,
      ttl: this.getTtl()
    })
  }

  async create (key, value) {
    const count = await this.model.countDocuments()
    if (count > this.cfg.limit) {
      logger.info('Reached cache limit, overwrite nearest for expiration')
      const model = await this.model.findOne({}).sort({ ttl: -1 }).exec()
      logger.debug('Removing:', model.key, model.value, model.ttl)
      await model.remove()
    }
    const expired = Date.now() + this.cfg.ttl * 1000

    // update or create
    return this.model.create({
      key,
      value,
      ttl: expired
    })
  }

  async find (key) {
    // or on db, {ttl: {$lt: Date.now()}}
    return this.model.findOne({ key })
  }

  generateValue () {
    return hyperid().uuid
  }

  async remove (key) {
    return this.model.deleteOne({ key })
  }

  async removeAll () {
    // drop problems
    return this.model.deleteMany({})
  }
}

module.exports = new CacheRepository(require('../models/cache'), require('../config').cache)
