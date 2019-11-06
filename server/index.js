const express = require('express')
const basicAuth = require('express-basic-auth')
const dotenv = require('dotenv')
const next = require('next')
const helmet = require('helmet')
const routes = require('../lib/routes')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true
if (DEV || process.env.DOTENV) {
  dotenv.config()
}
const PORT = process.env.PORT || 3003

const app = next({
  dev: DEV
})
const handler = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  server.use(
    helmet({
      hsts: {
        maxAge: 60 * 60 * 24 * 365, // 1 year to get preload approval
        preload: true,
        includeSubDomains: true
      },
      referrerPolicy: {
        policy: 'no-referrer'
      }
    })
  )

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (
        `${req.protocol}://${req.get('Host')}` !== process.env.PUBLIC_BASE_URL
      ) {
        return res.redirect(process.env.PUBLIC_BASE_URL + req.url)
      }
      return next()
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    server.use(
      basicAuth({
        users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
        challenge: true,
        realm: process.env.BASIC_AUTH_REALM
      })
    )
  }

  server.use(handler)

  server.listen(PORT, err => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
