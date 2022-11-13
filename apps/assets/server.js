const express = require('express')
const cors = require('cors')
const next = require('next')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const { PORT = 5020, CORS_ALLOWLIST_URL } = process.env

const additionalMiddlewares = []
let httpServer

const addMiddleware = (middleware) => {
  additionalMiddlewares.push(middleware)
}

const start = (workerId) => {
  const app = next({
    dev: DEV,
    port: PORT,
  })
  const handler = app.getRequestHandler()

  const server = express()

  server.disable('x-powered-by')

  // redirect to https
  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (!req.secure) {
        res.redirect(`https://${req.hostname}${req.url}`)
      } else {
        next()
      }
    })
  }

  if (CORS_ALLOWLIST_URL) {
    const corsOptions = {
      origin: CORS_ALLOWLIST_URL.split(','),
      credentials: true,
      // maxAge: <seconds>; up to 24 hours
      // @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
      maxAge: 60 * 60 * 24,
      optionsSuccessStatus: 200,
    }
    server.use('*', cors(corsOptions))
  }

  // special middlewares
  for (const middleware of additionalMiddlewares) {
    middleware(server)
  }

  server.use(express.static('public'))
  app.prepare().then(() => {
    server.all('*', (req, res) => {
      return handler(req, res)
    })
  })

  const callback = () => {
    if (workerId) {
      console.info(
        `server (${workerId}) is running on http://localhost:${PORT}`,
      )
    } else {
      console.info(`server is running on http://localhost:${PORT}`)
    }
  }
  httpServer = server.listen(PORT, callback)
  return httpServer
}

const close = () => {
  httpServer && httpServer.close()
}

module.exports = {
  start,
  close,
  addMiddleware,
}

process.on('SIGTERM', () => {
  close()
})
