// manual testing if the server performs a clean shutdown
const log = require('why-is-node-running')
const path = require('path')

// load env of server
require('@orbiting/backend-modules-env').config()

// require server's server.js and start
const Server = require('../../../servers/graphql/server')

Server.start()
  .then(async (server) => {
    setTimeout(() => {
      server.close()
        .then(() => {
          setTimeout(() => log(), 1000).unref()
        })
    }, 1000).unref()
  })
