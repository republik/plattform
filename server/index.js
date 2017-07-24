const express = require('express')
const dotenv = require('dotenv')

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true
if (DEV || process.env.DOTENV) {
  dotenv.config()
}

// server.js
const next = require('next')
const routes = require('./routes')
const app = next({
  dev: DEV
})
const handler = routes.getRequestHandler(app)

// With express
app.prepare().then(() => {
  express().use(handler).listen(process.env.PORT || 3003)
})
