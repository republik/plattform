const express = require('express')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, dir: './dist' })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.get('/user/:userId', (req, res) => {
    return app.render(
      req,
      res,
      '/user',
      Object.assign({}, req.query, { userId: req.params.userId })
    )
  })

  server.get('*', (req, res) => {
    handle(req, res)
  })
  server.listen(3000)
})
