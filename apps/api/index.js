require('@orbiting/backend-modules-env').config('apps/api/.env')
const server = require('./server')
const throng = require('throng')

const { CLUSTER, WEB_CONCURRENCY = 1 } = process.env

if (CLUSTER) {
  throng({
    workers: WEB_CONCURRENCY,
    grace: 30 * 1000,
    start: server.run,
  })
} else {
  server.run()
}
