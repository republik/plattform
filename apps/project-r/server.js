const express = require('express')
const basicAuth = require('express-basic-auth')
const next = require('next')
require('dotenv').config() // run before nl
const assets = require('./server/assets')

const fs = require('fs')
const dirPath = require('path')

const DEV = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 4000

const app = next({dir: '.', dev: DEV})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (`${req.protocol}://${req.get('Host')}` !== process.env.PUBLIC_BASE_URL) {
        return res.redirect(process.env.PUBLIC_BASE_URL + req.url)
      }
      return next()
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    server.use(basicAuth({
      users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
      challenge: true,
      realm: process.env.BASIC_AUTH_REALM
    }))
  }

  server.use(assets)

  server.get('/geschaeftsbericht', (req, res) => {
    res.redirect(301, 'https://cdn.republik.space/s3/republik-assets/assets/geschaeftsbericht2017_2018_fuer_gv_und_urabstimmung.pdf')
  })
  server.get('/index.html', (req, res) => {
    res.redirect(301, '/')
  })
  server.get('/crew', (req, res) => {
    res.redirect(302, '/')
  })
  server.get('/media.html', (req, res) => {
    res.redirect(301, '/media/2017-01-10-hotel-rothaus')
  })
  server.get('/newsletter.html', (req, res) => {
    res.redirect(301, '/newsletter/2017-01-10-hotel-rothaus')
  })
  server.get('/welcome_aboard.html', (req, res) => {
    res.redirect(301, '/newsletter/welcome')
  })
  server.get('/projects', (req, res) => {
    res.redirect(301, '/')
  })
  fs.readdirSync(dirPath.join(__dirname, 'pages/newsletter'))
    .map(file => dirPath.basename(file, '.js'))
    .filter(basename => basename[0] !== '.' && basename !== 'index')
    .forEach(staticSlug => {
      server.get(`/newsletter/${staticSlug}`, (req, res) => {
        return app.render(req, res, `/newsletter/${staticSlug}`, req.query)
      })
    })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
