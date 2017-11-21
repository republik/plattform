const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
  // use dynamic-dedupe: otherwise peerDependencies of symlinked modules don't work
  const dedupe = require('dynamic-dedupe')
  dedupe.activate()
}

const server = require('./server')
server.run()
