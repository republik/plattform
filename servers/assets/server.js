const express = require('express')
const cors = require('cors')
const { express: middlewares } = require('@orbiting/backend-modules-assets')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'

const {
  PORT,
  CORS_WHITELIST_URL
} = process.env

let server
module.exports.run = () => {
  server = express()

  // redirect to https
  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (!req.secure) {
        res.redirect(`https://${req.hostname}${req.url}`)
      }
      return next()
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

  // middlewares
  for (let key of Object.keys(middlewares)) {
    middlewares[key](server)
  }

  server.listen(PORT, () => {
    console.info('server is running on http://localhost:' + PORT)
  })
}

module.exports.close = () => {
  server.close()
}
