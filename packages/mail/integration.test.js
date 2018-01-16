require('dotenv').config({ path: '../../.test.env' })
const test = require('tape-async')
const getNewsletterSettings = require('./lib/getNewsletterSettings')
const updateNewsletterSubscription = require('./lib/updateNewsletterSubscription')

test('member user settings which does not exist on mailchimp', async (t) => {
  const settings = await getNewsletterSettings({
    email: 'kaufmae@me.com',
    roles: ['member']
  }, {
    t: console.log
  })
  t.equal(settings.subscriptions.length, 3)
  t.end()
})

test('user settings which does not exist on mailchimp', async (t) => {
  const settings = await getNewsletterSettings({
    email: 'kaufmae@me.com',
    roles: []
  }, {
    t: console.log
  })
  t.equal(settings.subscriptions.length, 3)
  t.end()
})

test('change user settings of user which is not on mailchimp', async (t) => {
  const settings = await updateNewsletterSubscription({
    user: {
      email: 'kaufmae@me.com',
      roles: ['member']
    },
    name: 'DAILY',
    subscribed: true,
    status: ''
  }, {
    t: console.log
  })
  t.equal(settings.subscribed, true)
  t.equal(settings.isEligible, true)
  t.equal(settings.name, 'DAILY')
  t.end()
})

// TODO: How to test here with postgres?!
// const updateUserOnMailchimp = require('./lib/updateUserOnMailchimp')
// test('add user to mailchimp', async (t) => {
//   updateUserOnMailchimp({
//     userId,
//     pgdb,
//     hasJustPaid,
//     isNew
//   })
//
//   const settings = await getNewsletterSettings({
//     email: 'kaufmae@me.com',
//     roles: []
//   }, {
//     t: console.log
//   })
//   t.equal(settings.subscriptions.length, 3)
//   t.end()
// })
