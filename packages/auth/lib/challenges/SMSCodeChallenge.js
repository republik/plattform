const uuid = require('uuid/v4')

const {
  sendTextMessage
} = require('@orbiting/backend-modules-sms')

const MIN_IN_MS = 1000 * 60
const HOUR_IN_MS = MIN_IN_MS * 60
const DAY_IN_MS = HOUR_IN_MS * 24

module.exports = {
  generateNewToken: async ({ pgdb, session, type }) => {
    const payload = uuid()
    const expiresAt = new Date(new Date().getTime() + DAY_IN_MS)
    return { payload, expiresAt }
  },
  startChallenge: async ({ context, token, country, phrase, ...rest }) => {
    console.log(context, rest)
    await sendTextMessage({
      text: 'hello',
      phoneNumber: '+41797340361'
    })
  },
  validateChallenge: async ({ pgdb, payload, type }) => {
    const foundToken = await pgdb.public.tokens.findOne({
      type,
      payload
    })
    return foundToken.id
  }
}
