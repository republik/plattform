require('@orbiting/backend-modules-env').config('.test.env')

const cleanup = async () => {
  const mailchimp = MailchimpInterface({ logger: console })
  await mailchimp.deleteMember(user().email)
  await mailchimp.deleteMember(`new_${user().email}`)
}

beforeAll(async () => {
  await cleanup()
})

afterAll(async () => {
  await cleanup()
})

const { createMail: _createMail } = require('./lib')
const MailchimpInterface = require('@orbiting/backend-modules-mailchimp')

const createMail = () =>
  _createMail([
    {
      name: 'DAILY',
      interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    },
    {
      name: 'WEEKLY',
      interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    },
    {
      name: 'PROJECTR',
      interestId: process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    },
  ])

// the mail address needs to stay the same while doing all the tests
const randomString =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)

const user = () => ({
  email: `${randomString}@test.project-r.construction`,
})

test('get some member data without configuring mail first', async () => {
  const getNewsletterSettings = require('@orbiting/backend-modules-mailchimp')
  expect(
    // updateNewsletterSubscriptions returns a promise
    getNewsletterSettings({ user: user('member') }),
  ).rejects.toThrow()
})

test('member user settings which does not exist on mailchimp', async () => {
  const { getNewsletterSettings } = createMail()
  const member = await getNewsletterSettings({ user: user('member') })
  expect(member.status).toBe('')
  expect(member.subscriptions.length).toBe(3)
  const subscribedSubscriptions = member.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(0)
})

test('single-subscription: change interest settings of user which is not subscribed', async () => {
  const { updateNewsletterSubscriptions, getNewsletterSettings } = createMail()
  const settings = await updateNewsletterSubscriptions({
    user: user('member'),
    name: 'DAILY',
    subscribed: true,
  })
  expect(settings.subscribed).toBe(true)
  expect(settings.name).toBe('DAILY')

  const member = await getNewsletterSettings({ user: user('member') })
  expect(member.status).toBe('subscribed')
  const subscribedSubscriptions = member.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(1)
})

test('multi-subscription: subscribe email to 1 more interest', async () => {
  const { updateNewsletterSubscriptions, getNewsletterSettings } = createMail()
  const interests = {}
  interests[process.env.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  await updateNewsletterSubscriptions({
    user: user(),
    interests,
  })
  const member = await getNewsletterSettings({ user: user() })
  expect(member.status).toBe('subscribed')
  const subscribedSubscriptions = member.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(2) // 2 because we set daily before
})

test('single-subscribe: unsubscribe from 1 interest', async () => {
  const { updateNewsletterSubscriptions, getNewsletterSettings } = createMail()
  const settings = await updateNewsletterSubscriptions({
    user: user(),
    name: 'PROJECTR',
    subscribed: false,
  })
  expect(settings.subscribed).toBe(false)
  expect(settings.name).toBe('PROJECTR')

  const member = await getNewsletterSettings({ user: user() })
  expect(member.status).toBe('subscribed')
  const subscribedSubscriptions = member.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(1)
})

test('resubscribe after unsubscription', async () => {
  const { updateNewsletterSubscriptions, getNewsletterSettings } = createMail()
  const settings = await updateNewsletterSubscriptions({
    user: user(),
    name: 'PROJECTR',
    subscribed: true,
  })
  expect(settings.subscribed).toBe(true)
  expect(settings.name).toBe('PROJECTR')

  const member = await getNewsletterSettings({ user: user() })
  expect(member.status).toBe('pending')
  const subscribedSubscriptions = member.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(0)
})

test('move subscriptions from one to another email address', async () => {
  const { changeEmailOnMailchimp, getNewsletterSettings } = createMail()
  const oldEmail = user().email
  const newEmail = `new_${oldEmail}`
  await changeEmailOnMailchimp({
    user: user(),
    newEmail,
  })

  const oldMember = await getNewsletterSettings({ user: user() })
  const newMember = await getNewsletterSettings({
    user: { ...user(), email: newEmail },
  })

  expect(oldMember.status).toBe('unsubscribed')
  expect(newMember.status).toBe('subscribed')

  const subscribedSubscriptions = newMember.subscriptions.filter(
    ({ subscribed }) => subscribed,
  )
  expect(subscribedSubscriptions.length).toBe(2)
})
