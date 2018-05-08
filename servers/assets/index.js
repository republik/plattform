require('@orbiting/backend-modules-env').config()
const server = require('./server')
const regiment = require('regiment')

const {
  CLUSTER,
  WEB_CONCURRENCY = 1,
  WEB_MEMORY = 512
} = process.env

if (CLUSTER) {
  server.addMiddleware(
    (server) =>
      server.use(regiment.middleware.MemoryFootprint(WEB_MEMORY))
  )
  regiment(
    server.start,
    {
      numWorkers: WEB_CONCURRENCY,
      deadline: 30 * 1000
    }
  )
} else {
  server.start()
}
