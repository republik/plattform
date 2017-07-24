const express = require('express')
const next = require('next')
const routes = require('./routes')
const dotenv = require('dotenv')
const basicAuth = require('express-basic-auth')

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true
if (DEV || process.env.DOTENV) {
  dotenv.config()
}

const app = next({ dev: DEV, dir: './' })
const handle = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, cb) => {
      const url = `${req.protocol}://${req.get('Host')}`

      if (url !== process.env.PUBLIC_BASE_URL) {
        return res.redirect(
          process.env.PUBLIC_BASE_URL + req.url
        )
      }
      return cb()
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    const opts = {
      users: {
        [process.env.BASIC_AUTH_USER]:
          process.env.BASIC_AUTH_PASS
      },
      challenge: true,
      realm: process.env.BASIC_AUTH_REALM
    }

    server.use(basicAuth(opts))
  }

  server.get('*', (req, res) => {
    handle(req, res)
  })

  server.listen(process.env.PORT || 3003)
})
