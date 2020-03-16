'use strict'

const { test } = require('tap')
const { build } = require('../helper')

const sinon = require('sinon')

const CacheModel = require('../../models/cache')
const cacheRepository = require('../../repository/cache')

test('get all keys', async t => {
  const spyGetAllKeys = sinon.spy(cacheRepository, 'getAllKeys')

  const app = await build(t)
  await CacheModel.collection.drop()
  await CacheModel.insertMany([
    { key: 'one', value: 'value one', ttl: Date.now() + 60000 },
    { key: 'two', value: 'value two', ttl: Date.now() + 90000 },
    { key: 'three', value: 'value three', ttl: Date.now() + 120000 }
  ])

  const res = await app
    .get('/api/cache')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.ok(spyGetAllKeys.calledOnce)
  t.deepEqual(res.body, { data: ['one', 'two', 'three'] })
  spyGetAllKeys.restore()
})

test('get cache by key', async t => {
  const app = await build(t)

  await CacheModel.collection.drop()
  await CacheModel.insertMany([
    { key: 'one', value: 'value one', ttl: Date.now() + 60000 }
  ])

  const res = await app
    .get('/api/cache/one')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'value one' })
})

test('update ttl', async t => {
  const stubGetTtl = sinon.stub(cacheRepository, 'getTtl')
  stubGetTtl.returns(1500000000000)
  const app = await build(t)

  await CacheModel.collection.drop()

  const originTtl = Date.now() + 60000
  await CacheModel.insertMany([
    { key: 'one', value: 'value one', ttl: originTtl }
  ])

  const res = await app
    .get('/api/cache/one')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'value one' })

  const model = await CacheModel.findOne({ key: 'one' })
  t.notEqual(model.ttl.toString(), new Date(originTtl).toString())
  t.equal(model.ttl.toString(), new Date(1500000000000).toString())
  stubGetTtl.restore()
})

test('get cache with expired ttl', async t => {
  const app = await build(t)
  const res = await app
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('get cache by nonexistent key', async t => {
  const app = await build(t)
  const res = await app
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('update cache by key', async t => {
  // todo expired update, non existed
  const app = await build(t)
  const res = await app
    .put('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})

test('remove cache', async t => {
  const app = await build(t)
  const res = await app
    .delete('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})

test('remove all cache', async t => {
  const app = await build(t)

  await CacheModel.deleteMany({})
  await CacheModel.insertMany([
    { key: 'one', value: 'value one', ttl: Date.now() + 60000 },
    { key: 'two', value: 'value two', ttl: Date.now() + 90000 },
    { key: 'three', value: 'value three', ttl: Date.now() + 120000 }
  ])

  const res = await app
    .delete('/api/cache')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
  const count = await CacheModel.countDocuments()

  t.equal(count, 0)
})

test('overwrite cache', async t => {
  const app = await build(t)
  const res = await app
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})
