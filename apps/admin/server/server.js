const express = require('express')
const next = require('next')
const basicAuth = require('express-basic-auth')
const helmet = require('helmet')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true
if (DEV || process.env.DOTENV) {
  require('dotenv').config()
}

const CSP_FRAME_ANCESTORS = process.env.CSP_FRAME_ANCESTORS?.split(',') || []

const app = next({ dev: DEV })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(
    helmet({
      hsts: {
        maxAge: 60 * 60 * 24 * 365, // 1 year to get preload approval
        preload: true,
        includeSubDomains: true,
      },
      referrerPolicy: {
        policy: 'no-referrer',
      },
      contentSecurityPolicy: {
        directives: {
          'frame-ancestors': ["'self'", ...CSP_FRAME_ANCESTORS].filter(Boolean),
        },
      },
      frameguard: false, // Depreacted in helmet@4, due lack of implementation
    }),
  )

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, cb) => {
      const url = `${req.protocol}://${req.get('Host')}`

      if (url !== process.env.PUBLIC_BASE_URL) {
        return res.redirect(process.env.PUBLIC_BASE_URL + req.url)
      }
      return cb()
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    const opts = {
      users: {
        [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS,
      },
      challenge: true,
      realm: process.env.BASIC_AUTH_REALM,
    }

    server.use(basicAuth(opts))
  }

  server.use(express.static('public'))
  server.get('*', (req, res) => {
    return handler(req, res)
  })

  server.listen(process.env.PORT || 3003)
})
