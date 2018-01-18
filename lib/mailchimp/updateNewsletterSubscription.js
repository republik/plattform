const { Roles } = require('@orbiting/backend-modules-auth')
const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  isEligibleForInterestId,
  nameToInterestId
} = require('./utils')

module.exports = async ({ userId, name, subscribed, status }, context) => {
  const { user: me, pgdb, t } = context
  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    console.error('user not found', { userId })
    throw new Error(t('api/users/404'))
  }
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter, admin'])

  const { roles, email } = user

  const interestId = nameToInterestId[name]
  if (!interestId) {
    console.error('interestId not supported in updateNewsletterSubscription', {
      interestId
    })
    throw new Error(t('api/newsletters/update/interestIdNotSupported'))
  }

  if (!isEligibleForInterestId(interestId, roles)) {
    console.error(
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
        console.error('updateNewsletterSubscription failed', { data })
      }
      return data
    })
    .catch(error => {
      console.error('updateNewsletterSubscription failed', { error })
      throw new Error(t('api/newsletters/update/failed'))
    })
  return NewsletterSubscription(userId, interestId, subscribed, roles)
}
