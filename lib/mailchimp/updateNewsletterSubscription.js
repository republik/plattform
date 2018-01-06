const fetch = require('isomorphic-unfetch')
const logger = console
const {
  NewsletterSubscription,
  getMemberApiUrl,
  isEligibleForInterestId,
  nameToInterestId
} = require('./utils')

module.exports = async ({ pgdb, userId, email, name, subscribed, roles }) => {
  try {
    const interestId = nameToInterestId[name]
    if (!interestId) {
      logger.error('interestId not supported in updateNewsletterSubscription', {
        interestId
      })
      return
    }

    if (!isEligibleForInterestId(interestId, roles)) {
      logger.error(
        'roles not eligible for interestId in updateNewsletterSubscription',
        {
          roles,
          interestId
        }
      )
      return
    }

    await fetch(getMemberApiUrl(email), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from('anystring:' + process.env.MAILCHIMP_API_KEY).toString(
            'base64'
          )
      },
      body: JSON.stringify({
        interests: {
          [interestId]: !!subscribed
        }
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status >= 400) {
          logger.error('updateNewsletterSubscription failed', { data })
        }
        return data
      })
      .catch(error =>
        logger.error('updateNewsletterSubscription failed', { error })
      )
    return NewsletterSubscription(userId, interestId, subscribed, roles)
  } catch (e) {
    logger.error(e, { userId })
  }
}
