import { Express } from 'express'
import bodyParser from 'body-parser'
import { verifySanityToken, verifyReadToken } from './auth'
import { discussionsHandler } from './discussions'
import { fetchEmbedVideoHandler } from './fetchEmbedVideo'
import { generateAudioHandler } from './generateAudio'
import { huebschWebhookHandler } from './huebschWebhook'
import { publishNotificationHandler } from './publishNotification'
import { subscriberCountHandler } from './subscriberCount'

const middleware = async (
  server: Express,
  pgdb: any,
  t: any,
  _redis: any,
  context: any,
) => {
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

  server.post(
    '/webhooks/sanity/publish-notification',
    bodyParser.json(),
    verifySanityToken,
    publishNotificationHandler,
  )

  server.get(
    '/webhooks/sanity/subscriber-count',
    verifyReadToken,
    subscriberCountHandler(context),
  )

  server.get(
    '/webhooks/sanity/fetch-embed-video',
    verifyReadToken,
    fetchEmbedVideoHandler,
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
