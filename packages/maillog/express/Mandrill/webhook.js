const debug = require('debug')('maillog:express:Mandrill:webhook')
const crypto = require('crypto')
const Promise = require('bluebird')

const bodyParser = require('body-parser')

const {
  MANDRILL_WEBHOOK_URL,
  MANDRILL_WEBHOOK_KEY
} = process.env

module.exports = async (server, pgdb) => {
  server.head(
    '/maillog/mandrill/webhook',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      return res.sendStatus(200)
    }
  )

  server.post(
    '/maillog/mandrill/webhook',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const signatureWebhook = req.header('X-Mandrill-Signature')

      const signedData = [
        MANDRILL_WEBHOOK_URL,
        ...Object.keys(req.body).map(key => `${key}${req.body[key]}`)
      ].filter(Boolean).join('')

      const signatureExpected = crypto
        .createHmac('sha1', MANDRILL_WEBHOOK_KEY)
        .update(signedData)
        .digest('base64')
        .toString()

      if (signatureWebhook !== signatureExpected) {
        debug('signature invalid: %o', { webhook: signatureWebhook, expected: signatureExpected })
        console.warn('Mandrill/webhook: signature invalid')

        return res.sendStatus(401)
      }

      try {
        const events = JSON.parse(req.body.mandrill_events)

        debug('%o', { events: events.length })

        await Promise.each(events, async event => {
          const record = await pgdb.public.mailLog.findOne({ 'result->>\'_id\'': event._id })

          if (record) {
            debug(
              'update record.id %s with event._id %s: %s',
              record.id,
              event._id,
              event.event
            )

            await pgdb.public.mailLog.updateOne(
              { id: record.id },
              { mandrillLastEvent: event, updatedAt: new Date() }
            )
          } else {
            debug('event._id %s not found', event._id)
          }
        })
      } catch (e) {
        console.warn(e)
      }

      return res.sendStatus(200)
    }
  )
}
