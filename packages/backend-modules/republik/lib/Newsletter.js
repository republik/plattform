const crypto = require('crypto')

const base64u = require('@orbiting/backend-modules-base64u')

const { NEWSLETTER_HMAC_KEY, FRONTEND_BASE_URL } = process.env

if (!NEWSLETTER_HMAC_KEY) {
  console.warn(
    'missing env NEWSLETTER_HMAC_KEY, the updateNewsletterSubscription mutation will not work with email and mac',
  )
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

const getConsentLink = (email, name, context) => {
  const link = new URL('/mitteilung', FRONTEND_BASE_URL)

  link.searchParams.set('type', 'newsletter')
  link.searchParams.set('name', name)
  link.searchParams.set('subscribed', '1')
  link.searchParams.set('email', base64u.encode(email))
  link.searchParams.set('mac', authenticate(email, name, true))
  link.searchParams.set('context', context || 'newsletter')

  return link.toString()
}

module.exports = {
  authenticate,
  getConsentLink,
}
