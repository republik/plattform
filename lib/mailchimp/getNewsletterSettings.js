const { Roles } = require('@orbiting/backend-modules-auth')
const fetch = require('isomorphic-unfetch')
const {
  NewsletterSubscription,
  getMemberApiUrl,
  supportedInterestIds
} = require('./utils')

module.exports.getNewsletterSettings = async (userId, context) => {
  const { user: me, pgdb, t } = context
  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    console.error('user not found', { userId })
    throw new Error(t('api/users/404'))
  }
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter, admin'])
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
        console.error(
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
              userId,
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
      console.error('getNewsletterProfile failed', { error })
      throw new Error(t('api/newsletters/get/failed'))
    })
}
