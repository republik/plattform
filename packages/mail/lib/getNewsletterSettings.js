const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  supportedInterestIds
} = require('./utils')
const logger = console

module.exports.getNewsletterSettings = async (user, { pgdb, t }) => {
  const { email, roles } = user

  return fetch(getMemberApiUrl(email), {
    method: 'GET',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('anystring:' + process.env.MAILCHIMP_API_KEY).toString(
          'base64'
        )
    }
  })
    .then(response => response.json())
    .then(data => {
      let interests
      if (data.status >= 400) {
        logger.error(
          'getNewsletterProfile failed, returning fallback response',
          { data }
        )
        interests = supportedInterestIds.reduce(
          (result, item) => {
            result[item] = false
            return result
          },
          {}
        )
      } else {
        interests = data.interests
      }

      const subscriptions = []
      supportedInterestIds.forEach(interestId => {
        if (interestId in interests) {
          subscriptions.push(
            NewsletterSubscription(
              user.id,
              interestId,
              data.status !== 'subscribed' ? false : interests[interestId],
              roles
            )
          )
        }
      })
      return { status: data.status, subscriptions }
    })
    .catch(error => {
      logger.error('getNewsletterProfile failed', { error })
      throw new Error(t('api/newsletters/get/failed'))
    })
}
