import * as express from 'express'
import * as next from 'next'
import routes from './routes'
import * as dotenv from 'dotenv'

const DEV = process.env.NODE_ENV
  ? process.env.NODE_ENV !== 'production'
  : true
if (DEV || process.env.DOTENV) {
  dotenv.config()
}

const app = next({ dev: DEV, dir: './dist' })
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
  server.get('*', (req, res) => {
    handle(req, res)
  })

  server.listen(process.env.PORT || 3003)
})
