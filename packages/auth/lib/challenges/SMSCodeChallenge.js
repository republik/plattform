const {
  sendTextMessage
} = require('@orbiting/backend-modules-sms')
const { parse, format } = require('libphonenumber-js')
const t = require('../t')

const MIN_IN_MS = 1000 * 60
const Type = 'SMS'

function generateSMSTokenCode () {
  // 2’176’782’336 possibilities, assuming 30 ms takes
  // 700 days to bruteforce the code through the API
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

async function getUserPhoneNumber (pgdb, email) {
  const user = await pgdb.public.users.findOne({ email })
  try {
    const parsedPhoneNumber = parse(user.phoneNumber || '', 'CH') // it could be any arbitrary string
    return format(parsedPhoneNumber.phone, parsedPhoneNumber.country, 'E.164')
  } catch (e) {
    throw new Error(t('api/auth/sms/phone-number-not-valid'))
  }
}

module.exports = {
  Type,
  generateSharedSecret: async ({ pgdb, user, email }) => {
    const sharedSecret = generateSMSTokenCode()
    const phoneNumber = await getUserPhoneNumber(pgdb, user.email)
    await sendTextMessage({
      text: t('api/auth/sms/shared-secret', { sharedSecret }),
      phoneNumber
    })
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id
      }, {
        isPhoneNumberVerified: false,
        phoneNumberVerificationCode: sharedSecret
      }
    )
    return sharedSecret
  },
  validateSharedSecret: async ({ pgdb, user }, { payload }) => {
    const isMatch = (user.phoneNumberVerificationCode === payload)
    if (!isMatch) return false
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id
      }, {
        isPhoneNumberVerified: true
      }
    )
    return true
  },
  generateNewToken: async ({ pgdb, session, email }) => {
    await getUserPhoneNumber(pgdb, email) // just check the phone number is valid
    const payload = generateSMSTokenCode()

    // as the code is exxtremely insecure,
    // we have to limit the time slot so there is only a very small chance to find
    // the code in 15 minutes
    const expiresAt = new Date(new Date().getTime() + (15 * MIN_IN_MS))
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, token, pgdb }) => {
    const phoneNumber = await getUserPhoneNumber(pgdb, email)
    await sendTextMessage({
      text: t('api/auth/sms/your-code', { code: token.payload }),
      phoneNumber
    })
    return true
  },
  validateChallenge: async ({ pgdb, user }, { payload }) => {
    const foundToken = await pgdb.public.tokens.findOne({
      type: Type,
      payload: payload.toUpperCase()
    })

    return foundToken && foundToken.id
  }
}
