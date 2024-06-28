jest.mock('check-env')
const config = {
  MAILCHIMP_INTEREST_MEMBER: 'MAILCHIMP_INTEREST_MEMBER',
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: 'MAILCHIMP_INTEREST_MEMBER_BENEFACTOR',
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
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
}
jest.mock('../../config', () => ({
  getConfig() {
    return config
  },
}))
import { enforceSubscriptions } from '../../lib/enforceSubscriptions'

describe('test enforceSubscriptions', () => {
  // mock env variables

  // mock addUserToAudience
  jest.mock('../../lib/addUserToAudience')
  jest.mock('../../lib/archiveMemberInAudience')
  jest.mock('../../lib/updateNewsletterSubscriptions')

  test('user has member interest', async () => {
    const userId = 'u12345678'
    const membershipTypeId = 'mt12345678'
    const user = { id: userId }
    const membershipType = { id: membershipTypeId }
    const pgdb = {
      public: {
        users: { findOne: jest.fn(() => user) },
        membershipTypes: { findOne: jest.fn(() => membershipType) },
      },
    }
    // mock return value for getInterestForUser
    const memberInterest = {}
    jest.mock('../../lib/getInterestsForUser', () => {
      jest.fn(() => memberInterest)
    })
    await enforceSubscriptions({
      userId: userId,
      email: 'user@example.com',
      subscribeToOnboardingMails: true,
      subscribeToEditorialNewsletters: true,
      pgdb: pgdb as any,
      name: '',
      subscribed: true,
    })
  })
})
