const { createNewsletterSubscription } = require('./NewsletterSubscription')

const INTEREST_ID_MEMBER_RESTRICTED = 'daily_interest_id'
const INTEREST_ID_PUBLIC = 'public_interest_id'

const interestConfiguration = [
  { name: 'MEMBER', interestId: INTEREST_ID_MEMBER_RESTRICTED, roles: ['member'] },
  { name: 'PUBLIC', interestId: INTEREST_ID_PUBLIC, roles: [] }
]

test('NewsletterSubscription -> correct flags', async () => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const sub1 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_MEMBER_RESTRICTED, true, ['member'])
  expect({
    name: sub1.name,
    subscribed: sub1.subscribed,
    isEligible: sub1.isEligible
  }).toEqual({
    name: 'MEMBER',
    subscribed: true,
    isEligible: true
  })

  const sub2 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_MEMBER_RESTRICTED, true, [])
  expect({
    name: sub2.name,
    subscribed: sub2.subscribed,
    isEligible: sub2.isEligible
  }).toEqual({
    name: 'MEMBER',
    subscribed: true,
    isEligible: false
  })

  const sub3 = NewsletterSubscription.buildSubscription('user_x', INTEREST_ID_PUBLIC, false, [])
  expect({
    name: sub3.name,
    subscribed: sub3.subscribed,
    isEligible: sub3.isEligible
  }).toEqual({
    name: 'PUBLIC',
    subscribed: false,
    isEligible: true
  })
})

test('NewsletterSubscription -> all interests', async () => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  expect(NewsletterSubscription.allInterestConfigurations()).toEqual(interestConfiguration)
})

test('NewsletterSubscription -> single interest', async () => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const interestId = NewsletterSubscription.interestIdByName('PUBLIC')
  expect(interestId).toEqual(interestConfiguration[1].interestId)
  const interest = NewsletterSubscription.interestConfiguration(interestId)
  expect(interest).toEqual(interestConfiguration[1])
})

test('NewsletterSubscription -> single interest', async () => {
  const NewsletterSubscription = createNewsletterSubscription(interestConfiguration)
  const interestIdPublic = NewsletterSubscription.interestIdByName('PUBLIC')
  const interestIdMember = NewsletterSubscription.interestIdByName('MEMBER')

  expect(
    NewsletterSubscription.isEligibleForInterestId(interestIdPublic, ['member'])
  ).toBeTruthy()
  expect(NewsletterSubscription.isEligibleForInterestId(interestIdPublic, [])).toBeTruthy()
  expect(
    NewsletterSubscription.isEligibleForInterestId(interestIdMember, ['member'])
  ).toBeTruthy()
  expect(NewsletterSubscription.isEligibleForInterestId(interestIdMember, [])).toBeFalsy()
})
