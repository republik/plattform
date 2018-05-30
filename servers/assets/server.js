const express = require('express')
const cors = require('cors')
const { express: middlewares } = require('@orbiting/backend-modules-assets')
const basicAuthMiddleware = require('@orbiting/backend-modules-auth/express/basicAuth')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const {
  PORT,
  CORS_WHITELIST_URL
} = process.env

let additionalMiddlewares = []
let httpServer

const addMiddleware = (middleware) => {
  additionalMiddlewares.push(middleware)
}

const start = (workerId) => {
  const server = express()

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

  if (CORS_WHITELIST_URL) {
    const corsOptions = {
      origin: CORS_WHITELIST_URL.split(','),
      credentials: true,
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
    server.use('*', cors(corsOptions))
  }

  basicAuthMiddleware(server)

  // special middlewares
  for (let middleware of additionalMiddlewares) {
    middleware(server)
  }

  // middlewares
  for (let key of Object.keys(middlewares)) {
    middlewares[key](server)
  }

  const callback = () => {
    if (workerId) {
      console.info(`server (${workerId}) is running on http://localhost:${PORT}`)
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
  addMiddleware
}

process.on('SIGTERM', () => {
  close()
})
