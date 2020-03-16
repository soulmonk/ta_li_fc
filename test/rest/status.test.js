'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('get status', async t => {
  const app = await build(t)
  const res = await app
    .get('/api/status')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  t.deepEqual(res.body, { data: 'ok' })
})

test('random url', async t => {
  const app = await build(t)
  const res = await app
    .get('/not-found-api')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(404)

  t.deepEqual(res.body, { error: 'Not found' })
})
