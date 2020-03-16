const express = require('express')
const config = require('./config')

function init () {
  const app = express()

  require('./libs/mongo')(config.mongo)

  require('./middleware')(app)
  require('./handlers')(app)

  return app
}

if (require.main === module) {
  init().listen(config.server.port, () => console.log(`App listening at http://localhost:${config.server.port}!`))
}

module.exports = init
