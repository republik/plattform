const fetch = require('isomorphic-unfetch')

const {
  MAILCHIMP_URL,
  MAILCHIMP_API_KEY,
  MAILCHIMP_FROM_NAME,
  MAILCHIMP_REPLY_TO
} = process.env

module.exports = async ({ title, subject }) => {
  return fetch(`${MAILCHIMP_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
    },
    body: JSON.stringify({
      type: 'regular',
      settings: {
        title,
        subject_line: subject,
        content_type: 'html',
        from_name: MAILCHIMP_FROM_NAME,
        reply_to: MAILCHIMP_REPLY_TO
      }
    })
  })
    .then(response => response.json())
    .catch(error => console.error('updateMailchimp failed', { error }))
}
