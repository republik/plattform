jest.mock('check-env')

const config = {
  MAILCHIMP_INTEREST_MEMBER: 'MAILCHIMP_INTEREST_MEMBER',
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: 'MAILCHIMP_INTEREST_MEMBER_BENEFACTOR',
  MAILCHIMP_INTEREST_PLEDGE: 'MAILCHIMP_INTEREST_PLEDGE',
  MAILCHIMP_INTEREST_GRANTED_ACCESS: 'MAILCHIMP_INTEREST_GRANTED_ACCESS',
  MAILCHIMP_MAIN_LIST_ID: 'MAILCHIMP_MAIN_LIST_ID',
  MAILCHIMP_ONBOARDING_AUDIENCE_ID: 'MAILCHIMP_ONBOARDING_AUDIENCE_ID',
  MAILCHIMP_MARKETING_AUDIENCE_ID: 'MAILCHIMP_MARKETING_AUDIENCE_ID',
  MAILCHIMP_PROBELESEN_AUDIENCE_ID: 'MAILCHIMP_PROBELESEN_AUDIENCE_ID',
  MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID: 'MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID',
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR:
    'MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR',
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE:
    'MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE',
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW: 'MAILCHIMP_INTEREST_NEWSLETTER_WDWWW',
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY: 'MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY',
  MAILCHIMP_INTEREST_NEWSLETTER_BAB: 'MAILCHIMP_INTEREST_NEWSLETTER_BAB',
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: 'MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY',
}
jest.mock('@orbiting/backend-modules-mailchimp', () => ({
  getConfig() {
    return config
  },
}))

const membershipResolver = require('../../../graphql/resolvers/Membership')

describe('check if autopay is mutable on membership', () => {
  const { autoPayIsMutable } = membershipResolver
  test('check autopay is not mutable due to membership type', () => {
    const membershipType = { autoPayMutable: false }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is mutable due to membership type', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(true)
  })

  test('check autopay is not mutable when membership is not active', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: false, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is not mutable when membership is not set to renew', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: false }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is not mutable when membership is not active and not set to renew', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: false, renew: false }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })
})
