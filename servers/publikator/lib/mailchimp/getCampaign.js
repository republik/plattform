const fetch = require('isomorphic-unfetch')

const {
  MAILCHIMP_URL,
  MAILCHIMP_API_KEY
} = process.env

module.exports = async ({ id }) => {
  return fetch(`${MAILCHIMP_URL}/campaigns/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
    }
  })
    .then(response => response.json())
    .catch(error => console.error('updateMailchimp failed', { error }))
}
