require('@orbiting/backend-modules-env').config()
const server = require('./server')
server.runOnce()
