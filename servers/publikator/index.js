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
    grace: 30 * 1000,
    master: server.runOnce,
    start: server.run
  })
} else {
  server.start()
}
