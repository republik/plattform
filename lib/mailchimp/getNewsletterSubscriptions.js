const { Roles } = require('@orbiting/backend-modules-auth')
const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  supportedInterestIds
} = require('./utils')

module.exports.getNewsletterSubscriptions = async (userId, context) => {
  const { user: me, pgdb, t } = context
  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    console.error('user not found', { userId })
    throw new Error(t('api/newsletters/userNotFound'))
  }
  Roles.userIsMeOrInRoles(user, me, ['supporter, admin'])
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
      if (data.status >= 400) {
        console.error('getNewsletterSubscriptions failed', { data })
        throw new Error(t('api/newsletters/get/failed'))
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
    .catch(error => {
      console.error('getNewsletterSubscriptions failed', { error })
      throw new Error(t('api/newsletters/get/failed'))
    })
}
