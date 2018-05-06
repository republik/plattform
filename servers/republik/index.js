require('@orbiting/backend-modules-env').config()
const server = require('./server')
const throng = require('throng')

const {
  CLUSTER,
  WEB_CONCURRENCY = 1
} = process.env

if (CLUSTER) {
  throng({
    workers: WEB_CONCURRENCY,
    grace: 30000,
    start: server.run,
    master: server.runOnce
  })
} else {
  server.start()
}
