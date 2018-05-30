require('@orbiting/backend-modules-env').config()
const test = require('tape-async')
const { createMail } = require('./lib')
const MailchimpInterface = require('./MailchimpInterface')

const prepare = () => createMail([
  { name: 'DAILY', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_DAILY, roles: ['member'] },
  { name: 'WEEKLY', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY, roles: ['member'] },
  { name: 'PROJECTR', interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR, roles: [] }
])

// the mail address needs to stay the same while doing all the tests
const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const user = (role) => ({
  email: `${randomString}@test.project-r.construction`,
  roles: role ? [role] : []
})

test('get some member data with configuring mail first', async (t) => {
  const getNewsletterSettings = require('./lib/getNewsletterSettings')
  try {
    await getNewsletterSettings({ user: user('member') })
    t.fail()
  } catch (e) {
    t.ok(true)
  }
  t.end()
})

test('member user settings which does not exist on mailchimp', async (t) => {
  const { getNewsletterSettings } = prepare()
  const member = await getNewsletterSettings({ user: user('member') })
  t.equal(member.status, '')
  t.equal(member.subscriptions.length, 3)
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 0)
  t.end()
})

test('illegible role for interest', async (t) => {
  const { updateNewsletterSubscription } = prepare()
  try {
    await updateNewsletterSubscription({
      user: user(),
      name: 'DAILY',
      subscribed: true
    })
    t.fail()
  } catch (e) {
    t.ok(true)
  }

  t.end()
})

test('single-subscription: change interest settings of user which is not subscribed', async (t) => {
  const { updateNewsletterSubscription, getNewsletterSettings } = prepare()
  const settings = await updateNewsletterSubscription({
    user: user('member'),
    name: 'DAILY',
    subscribed: true
  })
  t.equal(settings.subscribed, true)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'DAILY')

  const member = await getNewsletterSettings({ user: user('member') })
  t.equal(member.status, 'subscribed')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 1)
  t.end()
})

test('multi-subscription: subscribe email to 1 more interest', async (t) => {
  const { updateNewsletterSubscriptions, getNewsletterSettings } = prepare()
  const interests = {}
  interests[process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  await updateNewsletterSubscriptions({
    user: user(),
    interests
  })
  const member = await getNewsletterSettings({ user: user() })
  t.equal(member.status, 'subscribed')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 2) // 2 because we set daily before
  t.end()
})

test('single-subscribe: unsubscribe from 1 interest', async (t) => {
  const { updateNewsletterSubscription, getNewsletterSettings } = prepare()
  const settings = await updateNewsletterSubscription({
    user: user(),
    name: 'PROJECTR',
    subscribed: false
  })
  t.equal(settings.subscribed, false)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'PROJECTR')

  const member = await getNewsletterSettings({ user: user() })
  t.equal(member.status, 'subscribed')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 1)
  t.end()
})

test('unsubscripe from mailchimp completely (opt-out)', async (t) => {
  const { unsubscribeEmail } = prepare()
  const member = await unsubscribeEmail(user())
  t.equal(member.status, 'unsubscribed')
  t.end()
})

test('resubscribe after unsubscription', async (t) => {
  const { updateNewsletterSubscription, getNewsletterSettings } = prepare()
  const settings = await updateNewsletterSubscription({
    user: user(),
    name: 'PROJECTR',
    subscribed: true
  })
  t.equal(settings.subscribed, true)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'PROJECTR')

  const member = await getNewsletterSettings({ user: user() })
  t.equal(member.status, 'pending')
  const subscribedSubscriptions = member.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 0)
  t.end()
})

test('move subscriptions from one to another email address', async (t) => {
  const { moveNewsletterSubscriptions, getNewsletterSettings } = prepare()
  const oldEmail = user().email
  const newEmail = `new_${oldEmail}`
  await moveNewsletterSubscriptions({
    user: user(),
    newEmail
  })

  const oldMember = await getNewsletterSettings({ user: user() })
  const newMember = await getNewsletterSettings({ user: { ...user(), email: newEmail } })

  t.equal(oldMember.status, 'unsubscribed')
  t.equal(newMember.status, 'subscribed')

  const subscribedSubscriptions = newMember.subscriptions
    .filter(({ subscribed }) => subscribed)
  t.equal(subscribedSubscriptions.length, 2)

  t.end()
})

test('delete the e-mails after all this shit', async (t) => {
  const mailchimp = MailchimpInterface({ logger: console })
  await mailchimp.deleteMember(user().email)
  await mailchimp.deleteMember(`new_${user().email}`)
  t.end()
})
