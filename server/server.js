const express = require('express')
const next = require('next')
const routes = require('./routes')
const basicAuth = require('express-basic-auth')
const helmet = require('helmet')

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true
if (DEV || process.env.DOTENV) {
  require('dotenv').config()
}

const app = next({ dev: DEV })
const handle = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  server.use(helmet({
    hsts: {
      maxAge: 60 * 60 * 24 * 365, // 1 year to get preload approval
      preload: true,
      includeSubDomains: true
    },
    referrerPolicy: {
      policy: 'no-referrer'
    }
  }))

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

  server.use(express.static('public'))

  server.get('/', (req, res) => {
    res.redirect('/users')
  })
  server.get('/~:userId', (req, res) => {
    res.redirect(`/users/${req.params.userId}`)
  })
  server.get('*', (req, res) => {
    handle(req, res)
  })

  server.listen(process.env.PORT || 3003)
})
