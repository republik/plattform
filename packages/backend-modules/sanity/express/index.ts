import { Express } from 'express'
import bodyParser from 'body-parser'
import { verifySanityToken } from './auth'
import { discussionsHandler } from './discussions'

const middleware = async (server: Express, pgdb: any, t: any) => {
  server.post(
    '/webhooks/sanity/discussions',
    bodyParser.json(),
    verifySanityToken,
    discussionsHandler(pgdb, t),
  )
}

export default module.exports = middleware
