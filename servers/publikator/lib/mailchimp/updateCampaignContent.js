const fetch = require('isomorphic-unfetch')

const {
  MAILCHIMP_URL,
  MAILCHIMP_API_KEY
} = process.env

module.exports = async ({ campaignId, html }) => {
  return fetch(`${MAILCHIMP_URL}/campaigns/${campaignId}/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
    },
    body: JSON.stringify({
      html
    })
  })
    .then(response => response.json())
    .catch(error => console.error('updateMailchimp failed', { error }))
}
