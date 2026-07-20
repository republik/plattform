import { Express } from 'express'
import bodyParser from 'body-parser'
import { verifySanityToken } from './auth'
import { discussionsHandler } from './discussions'
import { generateAudioHandler } from './generateAudio'
import { huebschWebhookHandler } from './huebschWebhook'

const middleware = async (server: Express, pgdb: any, t: any) => {
  server.post(
    '/webhooks/sanity/discussions',
    bodyParser.json(),
    verifySanityToken,
    discussionsHandler(pgdb, t),
  )

  server.post(
    '/webhooks/sanity/generate-audio',
    bodyParser.json(),
    verifySanityToken,
    generateAudioHandler,
  )

  // No auth middleware — the signature is HMAC-verified inline
  // (per-document, expiring), since this is called by Huebsch, not Sanity.
  server.post(
    '/webhooks/huebsch/:documentId',
    bodyParser.json(),
    huebschWebhookHandler,
  )
}

export default module.exports = middleware
