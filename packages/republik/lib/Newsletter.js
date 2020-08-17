const crypto = require('crypto')

const {
  NEWSLETTER_HMAC_KEY
} = process.env

if (!NEWSLETTER_HMAC_KEY) {
  console.warn('missing env NEWSLETTER_HMAC_KEY, the updateNewsletterSubscription mutation will not work with email and mac')
}

const authenticate = (email, name, subscribed, t) => {
  if (!NEWSLETTER_HMAC_KEY) {
    console.error('missing NEWSLETTER_HMAC_KEY')
    throw new Error(t('api/newsletters/update/failed'))
  }
  return crypto
    .createHmac('sha256', NEWSLETTER_HMAC_KEY)
    .update(`${email}${name}${+subscribed}`)
    .digest('hex')
}

module.exports = {
  authenticate
}
