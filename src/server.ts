import * as express from 'express'
import * as next from 'next'
import routes from './routes'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, dir: './dist' })
const handle = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  // server.get('/users/:userId', (req, res) => {
  //   return app.render(
  //     req,
  //     res,
  //     '/user',
  //     Object.assign({}, req.query, {
  //       userId: req.params.userId
  //     })
  //   )
  // })

  server.get('*', (req, res) => {
    handle(req, res)
  })
  server.listen(3000)
})
