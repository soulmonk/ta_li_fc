'use strict'

const { Router } = require('express')
const cacheRepository = require('../repository/cache')
const logger = require('../libs/logger')

function init (app) {
  const router = Router()

  router.get('/', (req, res, next) => {
    logger.debug('get all keys')
    cacheRepository.getAllKeys()
      .then(keys => res.json({ data: keys }))
      .catch(next)
  })

  router.delete('/', (req, res, next) => {
    logger.debug('remove all')
    cacheRepository.removeAll()
      .then(() => res.json({ data: { success: true } }))
      .catch(next)
  })

  router.get('/:key', (req, res, next) => {
    logger.debug('get cache')
    cacheRepository.findOrCreate(req.params.key)
      .then(value => res.json({ data: value }))
      .catch(next)
  })

  router.put('/:key', (req, res, next) => {
    logger.debug('update cache')
    cacheRepository.update(req.params.key, req.body.value)
      .then(() => res.json({ data: { success: true } }))
      .catch(next)
  })

  router.delete('/:key', (req, res, next) => {
    logger.debug('remove cache')
    cacheRepository.remove(req.params.key)
      .then(() => res.json({ data: { success: true } }))
      .catch(next)
  })

  app.use('/api/cache', router)
}

module.exports = init
