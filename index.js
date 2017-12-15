const IS_DEV_ENV = process.env.NODE_ENV !== 'production'
if (IS_DEV_ENV) {
  require('dotenv').config()
  // use dynamic-dedupe: otherwise peerDependencies of symlinked modules don't work
  const dedupe = require('dynamic-dedupe')
  dedupe.activate()
}

process.env.PORT = process.env.PORT || 3020

const server = require('./server')
server.run()
