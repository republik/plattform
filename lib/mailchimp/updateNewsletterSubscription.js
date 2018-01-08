const { Roles } = require('@orbiting/backend-modules-auth')
const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  isEligibleForInterestId,
  nameToInterestId
} = require('./utils')

module.exports = async ({ userId, name, subscribed }, context) => {
  const { user: me, pgdb, t } = context
  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    throw new Error(t('api/newsletters/userNotFound'))
  }
  Roles.userIsMeOrInRoles(user, me, ['supporter, admin'])
  const { roles, email } = user

  try {
    const interestId = nameToInterestId[name]
    if (!interestId) {
      console.error(
        'interestId not supported in updateNewsletterSubscription',
        {
          interestId
        }
      )
      return
    }

    if (!isEligibleForInterestId(interestId, roles)) {
      console.error(
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
          console.error('updateNewsletterSubscription failed', { data })
        }
        return data
      })
      .catch(error =>
        console.error('updateNewsletterSubscription failed', { error })
      )
    return NewsletterSubscription(userId, interestId, subscribed, roles)
  } catch (e) {
    console.error(e, { userId })
  }
}
