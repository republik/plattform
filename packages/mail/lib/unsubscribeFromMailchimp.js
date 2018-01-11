const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')
const logger = console

const {
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID
} = process.env

module.exports = async ({
  email
}) => {
  if (!email) {
    logger.error('email is required in unsubscribeFromMailchimp', { email })
    return
  }

  const hash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex')
    .toLowerCase()

  await fetch(`${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + (Buffer.from('anystring:' + process.env.MAILCHIMP_API_KEY).toString('base64'))
    },
    body: JSON.stringify({
      email_address: email,
      status: 'unsubscribed'
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status >= 400) {
        logger.error('unsubscribeFromMailchimp failed', { data })
      }
      return data
    })
    .catch(error => logger.error('unsubscribeFromMailchimp failed', { error }))
}
