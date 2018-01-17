require('dotenv').config({ path: '../../.test.env' })
const test = require('tape-async')
const configure = require('./lib/configure')
const getNewsletterSettings = require('./lib/getNewsletterSettings')
const updateNewsletterSubscription = require('./lib/updateNewsletterSubscription')
const updateNewsletterSubscriptions = require('./lib/updateNewsletterSubscriptions')
const unsubscribeFromAllNewsletters = require('./lib/unsubscribeFromAllNewsletters')

const prepare = () => {
  configure([
    { name: 'DAILY', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_DAILY, roles: ['member'] },
    { name: 'WEEKLY', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY, roles: ['member'] },
    { name: 'PROJECTR', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR, roles: [] }
  ])
}

const user = (role) => ({
  email: 'test2@test.project-r.construction',
  roles: role ? [role] : []
})

test('member user settings which does not exist on mailchimp', async (t) => {
  prepare()
  const member = await getNewsletterSettings(user('member'))
  t.ok(member.status)
  t.equal(member.subscriptions.length, 3)
  t.end()
})

test('change interest settings of user which is not subscribed', async (t) => {
  prepare()
  const settings = await updateNewsletterSubscription({
    user: user('member'),
    name: 'DAILY',
    subscribed: true,
    status: ''
  })
  t.equal(settings.subscribed, true)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'DAILY')

  const member = await getNewsletterSettings(user('member'))
  t.equal(member.status, 'pending')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 0)
  t.end()
})

test('illegible role for interest', async (t) => {
  prepare()
  try {
    await updateNewsletterSubscription({
      user: user(),
      name: 'DAILY',
      subscribed: true,
      status: 'subscribed'
    })
    t.fail()
  } catch (e) {
    t.ok(true)
  }

  t.end()
})

test('subscribe email to 1 of 3 interests', async (t) => {
  prepare()
  const interests = {}
  interests[process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  await updateNewsletterSubscriptions({
    user: user(),
    interests
  })
  const member = await getNewsletterSettings(user())
  t.equal(member.status, 'subscribed')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 2)
  t.end()
})

test('change interest setting of 1 interest', async (t) => {
  prepare()
  const settings = await updateNewsletterSubscription({
    user: user(),
    name: 'PROJECTR',
    subscribed: true
  })
  t.equal(settings.subscribed, true)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'PROJECTR')

  const member = await getNewsletterSettings(user())
  t.equal(member.status, 'pending')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 0)
  t.end()
})

test('unsubscripe from all newsletters', async (t) => {
  prepare()
  const member = await unsubscribeFromAllNewsletters({
    email: 'test@test.project-r.construction'
  })
  t.notEqual(member.status, 'subscribed')
  t.end()
})
