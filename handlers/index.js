'use strict'

function init (app) {
  app.get('/api/status', (req, res) => {
    res.json({ data: 'ok' })
  })

  require('./cache')(app)

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(require('./errors'))
}

module.exports = init
