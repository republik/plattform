import { handleStripeWebhook } from './webhook/stripe'
import type { Request, Response, Router } from 'express'
import bodyParser from 'body-parser'

export default async (
  server: Router,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _t: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _redis: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _connectionContext: any,
) => {
  server.post(
    '/webhooks/:company/stripe',
    bodyParser.raw({ type: '*/*' }),
    (req: Request, res: Response) => handleStripeWebhook(req, res),
  )
}
