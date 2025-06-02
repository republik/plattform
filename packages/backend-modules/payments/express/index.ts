import { handleStripeWebhook } from './webhook/stripe'
import type { Request, Response, Router } from 'express'
import bodyParser from 'body-parser'
import { PgDb } from 'pogi'

export default async (server: Router, pgdb: PgDb) => {
  console.log("payment webhook endpoint registered")
  server.post(
    '/webhooks/:company/stripe',
    bodyParser.raw({ type: '*/*' }),
    (req: Request, res: Response) => {
      return handleStripeWebhook(req, res, { pgdb })
    },
  )
}
