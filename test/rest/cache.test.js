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

// no create in task
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
  t.notEqual(model.ttl.toUTCString(), new Date(originTtl).toUTCString())
  t.equal(model.ttl.toUTCString(), new Date(1500000000000).toUTCString())
  stubGetTtl.restore()
})

test('get cache with expired ttl', async t => {
  const app = await build(t)

  const stubGetTtl = sinon.stub(cacheRepository, 'getTtl')
  stubGetTtl.returns(1510000000000)
  const stubGenerateValue = sinon.stub(cacheRepository, 'generateValue')
  stubGenerateValue.returns('some_unique_uuid')

  await CacheModel.insertMany([
    { key: 'one_expired', value: 'value expired one', ttl: Date.now() - 10000 }
  ])

  const res = await app
    .get('/api/cache/one_expired')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'some_unique_uuid' })

  const model = await CacheModel.findOne({ key: 'one_expired' })
  t.equal(model.ttl.toUTCString(), new Date(1510000000000).toUTCString())
  stubGetTtl.restore()
  stubGenerateValue.restore()
})

test('get cache by nonexistent key', async t => {
  const app = await build(t)

  const stubGetTtl = sinon.stub(cacheRepository, 'getTtl')
  stubGetTtl.returns(1520000000000)
  const stubGenerateValue = sinon.stub(cacheRepository, 'generateValue')
  stubGenerateValue.returns('some_unique_uuid-for-nonexistent_key')

  const res = await app
    .get('/api/cache/nonexistent')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'some_unique_uuid-for-nonexistent_key' })

  const model = await CacheModel.findOne({ key: 'nonexistent' })
  t.equal(model.ttl.toUTCString(), new Date(1520000000000).toUTCString())
  stubGetTtl.restore()
  stubGenerateValue.restore()
})

test('update cache by key', async t => {
  const app = await build(t)

  // todo expired update, non existed
  const stubGetTtl = sinon.stub(cacheRepository, 'getTtl')
  stubGetTtl.returns(1535000000000)
  const stubGenerateValue = sinon.stub(cacheRepository, 'generateValue')
  stubGenerateValue.returns('some_unique_uuid-for-nonexistent_key')

  await CacheModel.insertMany([
    { key: 'my-supper-key', value: 'value one', ttl: Date.now() + 60000 }
  ])

  const res = await app
    .put('/api/cache/my-supper-key')
    .send({ value: 'my-new-value' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })

  const model = await CacheModel.findOne({ key: 'my-supper-key' })
  t.equal(model.value, 'my-new-value')
  t.equal(model.ttl.toUTCString(), new Date(1535000000000).toUTCString())
  stubGetTtl.restore()
  stubGenerateValue.restore()
})

test('remove cache', async t => {
  const app = await build(t)

  await CacheModel.collection.drop()
  await CacheModel.insertMany([
    { key: 'for-remove-key', value: 'remove value one', ttl: Date.now() + 60000 }
  ])

  const res = await app
    .delete('/api/cache/for-remove-key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })

  const model = await CacheModel.findOne({ key: 'for-remove-key' })
  t.ok(!model)

  const count = await CacheModel.countDocuments()
  t.equal(count, 0)
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

  const stubGetTtl = sinon.stub(cacheRepository, 'getTtl')
  stubGetTtl.returns(1540000000000)
  const stubGenerateValue = sinon.stub(cacheRepository, 'generateValue')
  stubGenerateValue.returns('some_overwrite cache')

  await CacheModel.deleteMany({})
  await CacheModel.insertMany([
    { key: 'one', value: 'value one', ttl: Date.now() + 60000 },
    { key: 'two', value: 'value two', ttl: Date.now() + 90000 },
    { key: 'three', value: 'value three', ttl: Date.now() + 120000 }
  ])

  // todo create
  const res = await app
    .get('/api/cache/overwrite-key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'some_overwrite cache' })

  let model = await CacheModel.findOne({ key: 'one' })
  t.ok(!model)

  model = await CacheModel.findOne({ key: 'overwrite-key' })
  t.equal(model.value, 'some_overwrite cache')
  t.equal(model.ttl.toUTCString(), new Date(1540000000000).toUTCString())

  const count = await CacheModel.countDocuments()
  t.equal(count, 3)
})
