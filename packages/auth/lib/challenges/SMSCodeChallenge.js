const {
  sendTextMessage
} = require('@orbiting/backend-modules-sms')
const { parse, format } = require('libphonenumber-js')

const MIN_IN_MS = 1000 * 60

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
    throw new Error('Phone number not valid for Text Messaging')
  }
}

module.exports = {
  generateSharedSecret: async ({ pgdb, user, email }) => {
    const sharedCode = generateSMSTokenCode()
    const phoneNumber = await getUserPhoneNumber(pgdb, email)
    await sendTextMessage({
      text: `SMS Login Authorisierung: ${sharedCode}`,
      phoneNumber
    })
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id
      }, {
        isSMSChallengeSecretVerified: false,
        smsChallengeSecret: sharedCode
      }
    )
    return sharedCode
  },
  validateSharedSecret: async ({ pgdb, payload, user }) => {
    const isMatch = (user.smsChallengeSecret === payload)
    if (!isMatch) return false
    await pgdb.public.users.updateAndGetOne(
      {
        id: user.id
      }, {
        isSMSChallengeSecretVerified: true
      }
    )
    return true
  },
  generateNewToken: async ({ pgdb, session, type, email }) => {
    await getUserPhoneNumber(pgdb, email) // just check the phone number is valid
    const payload = generateSMSTokenCode()

    // as the code is exxtremely insecure,
    // we have to limit the time slot so there is only a very small chance to find
    // the code in 15 minutes
    const expiresAt = new Date(new Date().getTime() + (15 * MIN_IN_MS))
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, context, token, country, phrase, pgdb }) => {
    const phoneNumber = await getUserPhoneNumber(pgdb, email)
    await sendTextMessage({
      text: `Dein Code: ${token.payload}`,
      phoneNumber
    })
  },
  validateChallenge: async ({ pgdb, payload, type, user }) => {
    console.log(`Validate SMS Code challenge for ${user.id}: ${payload} (client)`)
    const foundToken = await pgdb.public.tokens.findOne({
      type,
      payload: payload.toUpperCase()
    })

    return foundToken.id
  }
}
