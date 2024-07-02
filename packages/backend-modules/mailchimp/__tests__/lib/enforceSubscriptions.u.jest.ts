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
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: 'MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY',

}
jest.mock('../../config', () => ({
  getConfig() {
    return config
  },
}))
jest.mock('../../lib/getInterestsForUser', () => ({
  getInterestsForUser() {
    console.log('mocked')
    return {
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: true,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true,
    }
  },
}))
jest.mock('../../lib/addUserToAudience')
jest.mock('../../lib/archiveMemberInAudience')
jest.mock('../../lib/updateNewsletterSubscriptions')
import { enforceSubscriptions } from '../../lib/enforceSubscriptions'

describe('test enforceSubscriptions', () => {

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
    // const memberInterest = {}
    
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
