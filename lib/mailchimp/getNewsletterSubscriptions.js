const fetch = require('isomorphic-unfetch')
const logger = console
const {
  NewsletterSubscription,
  getMemberApiUrl,
  supportedInterestIds
} = require('./utils')

module.exports.getNewsletterSubscriptions = async (userId, email, roles) => {
  try {
    if (!email) {
      logger.error('email missing in getNewsletterSubscriptions', {
        email
      })
      return
    }

    const subscriptions = await fetch(getMemberApiUrl(email), {
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
        if (data.status >= 400) {
          logger.error('getNewsletterSubscriptions failed', { data })
        }

        const subscriptions = []
        supportedInterestIds.forEach(interestId => {
          if (interestId in data.interests) {
            subscriptions.push(
              NewsletterSubscription(
                userId,
                interestId,
                data.interests[interestId],
                roles
              )
            )
          }
        })
        return subscriptions
      })
      .catch(error =>
        logger.error('getNewsletterSubscriptions failed', { error })
      )
    return subscriptions
  } catch (e) {
    logger.error(e, { userId })
  }
}
