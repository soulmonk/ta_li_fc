'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('get all keys', async t => {
  const res = await build(t)
    .get('/api/cache')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: [] })
})

test('get cache by key', async t => {
  const res = await build(t)
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('update ttl', async t => {
  const res = await build(t)
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('get cache with expired ttl', async t => {
  const res = await build(t)
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('get cache by nonexistent key', async t => {
  const res = await build(t)
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: '' })
})

test('update cache by key', async t => {
  // todo expired update, non existed
  const res = await build(t)
    .put('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})

test('remove cache', async t => {
  const res = await build(t)
    .delete('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})

test('remove all cache', async t => {
  const res = await build(t)
    .delete('/api/cache')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})

test('overwrite cache', async t => {
  const res = await build(t)
    .get('/api/cache/:key')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: { success: true } })
})
