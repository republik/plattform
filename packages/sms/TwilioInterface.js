const checkEnv = require('check-env')
const twilio = require('twilio')

const {
  TWILIO_API_ACCOUNT_SID,
  TWILIO_API_AUTH_TOKEN,
  TWILIO_DEFAULT_SENDER_NUMBER
} = process.env

const TwilioInterface = ({ logger }) => {
  checkEnv([
    'TWILIO_API_ACCOUNT_SID',
    'TWILIO_API_AUTH_TOKEN',
    'TWILIO_DEFAULT_SENDER_NUMBER'
  ])
  return {
    async send (text, phoneNumber) {
      try {
        const client = new twilio(TWILIO_API_ACCOUNT_SID, TWILIO_API_AUTH_TOKEN) // eslint-disable-line
        const message = await client.messages.create({
          body: text,
          to: phoneNumber,
          from: TWILIO_DEFAULT_SENDER_NUMBER
        })
        logger.log(message)
      } catch (error) {
        logger.error(`twilio -> exception: ${error.message}`)
      }
    }
  }
}

module.exports = TwilioInterface
