require('@orbiting/backend-modules-env').config({testing: true})
const test = require('tape-async')
const { createNewsletterSubscription } = require('./NewsletterSubscription')

const INTEREST_ID_MEMBER_RESTRICTED = 'daily_interest_id'
const INTEREST_ID_PUBLIC = 'public_interest_id'

const interestConfiguration = [
  { name: 'MEMBER', interestId: INTEREST_ID_MEMBER_RESTRICTED, roles: ['member'] },
  { name: 'PUBLIC', interestId: INTEREST_ID_PUBLIC, roles: [] }
]

test('NewsletterSubscription -> correct flags', async (t) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const sub1 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_MEMBER_RESTRICTED, true, ['member'])
  t.deepEqual({
    name: sub1.name,
    subscribed: sub1.subscribed,
    isEligible: sub1.isEligible
  }, {
    name: 'MEMBER',
    subscribed: true,
    isEligible: true
  })

  const sub2 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_MEMBER_RESTRICTED, true, [])
  t.deepEqual({
    name: sub2.name,
    subscribed: sub2.subscribed,
    isEligible: sub2.isEligible
  }, {
    name: 'MEMBER',
    subscribed: true,
    isEligible: false
  })

  const sub3 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_PUBLIC, false, [])
  t.deepEqual({
    name: sub3.name,
    subscribed: sub3.subscribed,
    isEligible: sub3.isEligible
  }, {
    name: 'PUBLIC',
    subscribed: false,
    isEligible: true
  })

  t.end()
})

test('NewsletterSubscription -> all interests', async (t) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  t.deepEqual(NewsletterSubscription.allInterestConfigurations(), interestConfiguration)
  t.end()
})

test('NewsletterSubscription -> single interest', async (t) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const interestId = NewsletterSubscription.interestIdByName('PUBLIC')
  t.deepEqual(interestId, interestConfiguration[1].interestId)
  const interest = NewsletterSubscription.interestConfiguration(interestId)
  t.deepEqual(interest, interestConfiguration[1])
  t.end()
})

test('NewsletterSubscription -> single interest', async (t) => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const interestIdPublic = NewsletterSubscription.interestIdByName('PUBLIC')
  const interestIdMember = NewsletterSubscription.interestIdByName('MEMBER')

  t.ok(NewsletterSubscription.isEligibleForInterestId(interestIdPublic, ['member']))
  t.ok(NewsletterSubscription.isEligibleForInterestId(interestIdPublic, []))
  t.ok(NewsletterSubscription.isEligibleForInterestId(interestIdMember, ['member']))
  t.notOk(NewsletterSubscription.isEligibleForInterestId(interestIdMember, []))

  t.end()
})
