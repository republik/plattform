
import { enforceSubscriptions } from '../../lib/enforceSubscriptions'
jest.mock('check-env')

describe('test enforceSubscriptions', () => {
  // mock env variables
  const config = {
    MAILCHIMP_INTEREST_MEMBER: 'MAILCHIMP_INTEREST_MEMBER',
    MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: 'MAILCHIMP_INTEREST_MEMBER_BENEFACTOR',
    MAILCHIMP_MAIN_LIST_ID: 'MAILCHIMP_MAIN_LIST_ID',
    MAILCHIMP_ONBOARDING_AUDIENCE_ID: 'MAILCHIMP_ONBOARDING_AUDIENCE_ID',
    MAILCHIMP_MARKETING_AUDIENCE_ID: 'MAILCHIMP_MARKETING_AUDIENCE_ID',
    MAILCHIMP_PROBELESEN_AUDIENCE_ID: 'MAILCHIMP_PROBELESEN_AUDIENCE_ID',
    MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID: 'MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID',
    MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR: 'MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR',
    MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE: 'MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE',
    MAILCHIMP_INTEREST_NEWSLETTER_WDWWW: 'MAILCHIMP_INTEREST_NEWSLETTER_WDWWW',
  }
  jest.mock('../config', () => config)

  // mock addUserToAudience
  jest.mock('./addUserToAudience')
  jest.mock('./archiveMemberInAudience')
  jest.mock('./updateNewsletterSubscriptions')

  test('user has member interest', async () => {
    const userId = '12345678'
    const user = { userId: userId }
    const pgdb = { public: { users: { findOne: jest.fn(() => user) }}}
    // mock return value for getInterestForUser
    const memberInterest = {}
    jest.mock('./getInterestsForUser', () => { jest.fn(() => memberInterest) })

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
