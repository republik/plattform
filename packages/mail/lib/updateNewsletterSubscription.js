const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  isEligibleForInterestId,
  nameToInterestId
} = require('./utils')
const logger = console

module.exports = async ({ user, name, subscribed, status }, { pgdb, t }) => {
  const { roles, email } = user
  const interestId = nameToInterestId[name]
  if (!interestId) {
    console.error('interestId not supported in updateNewsletterSubscription', {
      interestId
    })
    throw new Error(t('api/newsletters/update/interestIdNotSupported'))
  }

  if (!isEligibleForInterestId(interestId, roles)) {
    logger.error(
      'roles not eligible for interestId in updateNewsletterSubscription',
      {
        roles,
        interestId
      }
    )
    throw new Error(t('api/newsletters/update/rolesNotEligible'))
  }

  // If a user subscribes to a newsletter but their status is not subscribed,
  // we need to set their status to 'pending' which triggers a new confirmation email
  // from mailchimp to re-subscribe.
  const body = subscribed && status !== 'subscribed'
    ? {
      email_address: email,
      status: 'pending',
      interests: {
        [interestId]: !!subscribed
      }
    }
    : {
      interests: {
        [interestId]: !!subscribed
      }
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
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(data => {
      if (data.status >= 400) {
        logger.error('updateNewsletterSubscription failed', { data })
      }
      return data
    })
    .catch(error => {
      logger.error('updateNewsletterSubscription failed', { error })
      throw new Error(t('api/newsletters/update/failed'))
    })
  return NewsletterSubscription(user.id, interestId, subscribed, roles)
}
