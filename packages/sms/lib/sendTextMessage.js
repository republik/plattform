const TwilioInterface = require('../TwilioInterface')
const logger = console

const {
  NODE_ENV,
  SEND_SMS
} = process.env

module.exports = async ({ text = null, phoneNumber = null }) => {
  // sanitize
  const DEV = NODE_ENV && NODE_ENV !== 'production'
  if (SEND_SMS === 'false' || (DEV && SEND_SMS !== 'true')) {
    logger.log('\n\nSEND_SMS prevented sms from being sent\n(SEND_SMS == false or NODE_ENV != production and SEND_SMS != true):\n', text, phoneNumber)
    return true
  }

  const twilio = TwilioInterface({ logger })
  return twilio.send(text, phoneNumber)
}
