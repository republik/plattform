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
  getInterestsForUser: 
    jest.fn()
    // active membership
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: true,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true,
    }))
    // no active membership
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true,
    }))
    // noc active membership, no free newsletters
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
    })),
}))
import {
  addUserToAudience,
  addUserToMarketingAudience,
} from '../../lib/addUserToAudience'
jest.mock('../../lib/addUserToAudience', () => ({
  addUserToAudience: jest.fn(() => 'addUserToAudience mocked'),
  addUserToMarketingAudience: jest.fn(() => 'addUserToMarketingAudience mocked')
}))
const addUserToAudienceMock = addUserToAudience as unknown as jest.Mock<typeof addUserToAudience>

import { getSegmentDataForUser } from '../../lib/getSegmentDataForUser'
jest.mock('../../lib/getSegmentDataForUser', () => ({
  getSegmentDataForUser: jest.fn(() => 'getSegmentDataForUser mocked')
}))

import { archiveMemberInAudience } from '../../lib/archiveMemberInAudience'
jest.mock('../../lib/archiveMemberInAudience', () => ({
  archiveMemberInAudience: jest.fn(() => 'archiveMemberInAudience mocked'),
}))
const archiveMemberInAudienceMock = archiveMemberInAudience as unknown as jest.Mock<typeof archiveMemberInAudience>

import { updateNewsletterSubscriptions } from '../../lib/updateNewsletterSubscriptions'
jest.mock('../../lib/updateNewsletterSubscriptions', () => ({
  updateNewsletterSubscriptions: jest.fn(
    () => 'updateNewsletterSubscriptions mocked',
  ),
}))

import MailchimpInterface from '../../MailchimpInterface'
import { enforceSubscriptions } from '../../lib/enforceSubscriptions'

afterEach(() => {
  archiveMemberInAudienceMock.mockClear()
  addUserToAudienceMock.mockClear()
})

describe('test enforceSubscriptions', () => {
  test('user has member interest, onboarding mails', async () => {
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

    await enforceSubscriptions({
      userId: userId,
      email: 'user@example.com',
      subscribeToOnboardingMails: true,
      subscribeToEditorialNewsletters: true,
      pgdb: pgdb as any, 
      name: '',
      subscribed: true,
    })

    expect(updateNewsletterSubscriptions).toHaveBeenCalled()
    expect(getSegmentDataForUser).toHaveBeenCalled()
    expect(addUserToAudience).toHaveBeenCalled()
    expect(archiveMemberInAudience).toHaveBeenCalled()

    expect(addUserToMarketingAudience).not.toHaveBeenCalled()

    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_MARKETING_AUDIENCE_ID,
    })
    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PROBELESEN_AUDIENCE_ID,
    })

    expect(addUserToAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })

    // should be called if subscribedToOnboadringMails is true
    expect(addUserToAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_ONBOARDING_AUDIENCE_ID,
      interests: {},
      statusIfNew: MailchimpInterface.MemberStatus.Subscribed,
      defaultStatus: MailchimpInterface.MemberStatus.Subscribed,
    })
  })

  test('user does not have member interest, no onboarding mails, but free newsletters', async () => {
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

    await enforceSubscriptions({
      userId: userId,
      email: 'user@example.com',
      subscribeToOnboardingMails: false,
      subscribeToEditorialNewsletters: false,
      pgdb: pgdb as any,
      name: '',
      subscribed: true,
    })

    expect(addUserToAudience).not.toHaveBeenCalled()
    expect(archiveMemberInAudience).toHaveBeenCalled()

    expect(addUserToMarketingAudience).toHaveBeenCalled()

    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })

    // should be called if subscribedToOnboadringMails is true
    expect(addUserToAudience).not.toHaveBeenCalled()
  })

  test('user does not have member interest, no onboarding mails, no free newsletters', async () => {
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

    await enforceSubscriptions({
      userId: userId,
      email: 'user@example.com',
      subscribeToOnboardingMails: false,
      subscribeToEditorialNewsletters: false,
      pgdb: pgdb as any,
      name: '',
      subscribed: true,
    })

    expect(addUserToAudience).not.toHaveBeenCalled()
    expect(addUserToMarketingAudience).toHaveBeenCalled()

    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })
    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_MAIN_LIST_ID,
    })
  })
})
