jest.mock('check-env')
const config = {
  MAILCHIMP_INTEREST_MEMBER: 'MAILCHIMP_INTEREST_MEMBER',
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: 'MAILCHIMP_INTEREST_MEMBER_BENEFACTOR',
  MAILCHIMP_INTEREST_PLEDGE: 'MAILCHIMP_INTEREST_PLEDGE',
  MAILCHIMP_INTEREST_GRANTED_ACCESS: 'MAILCHIMP_INTEREST_GRANTED_ACCESS',
  MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL: 'MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL',
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
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: 'MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY',
  REGWALL_TRIAL_CAMPAIGN_ID: 'REGWALL_TRIAL_CAMPAIGN_ID'
}
jest.mock('../../config', () => ({
  getConfig() {
    return config
  },
}))
jest.mock('@orbiting/backend-modules-republik/lib/Newsletter', () => ({
  getConsentLink: jest.fn(() => 'getConsentLink mocked'),
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
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: false,
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
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true,
    }))
    // no active membership, no free newsletters
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
    }))
    // no active membership, no free newsletters, active trial
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: false,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: true,
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: false,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
    }))
    // no active membership, active regwall trial
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: false,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: true,
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true,
      [config.MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: false,
    }))
    // no active membership, no active trial, no free newsletters, past regwall trial
    .mockImplementationOnce(() => ({
      [config.MAILCHIMP_INTEREST_PLEDGE]: true,
      [config.MAILCHIMP_INTEREST_MEMBER]: false,
      [config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: false,
      [config.MAILCHIMP_INTEREST_GRANTED_ACCESS]: false,
      [config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]: true,
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
const addUserToMarketingAudienceMock = addUserToMarketingAudience as unknown as jest.Mock<typeof addUserToMarketingAudience>

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

import { getMailchimpMember } from '../../lib/getMailchimpMember'
jest.mock('../../lib/getMailchimpMember', () => ({
  getMailchimpMember: jest.fn()
}))

import MailchimpInterface from '../../MailchimpInterface'
import { enforceSubscriptions } from '../../lib/enforceSubscriptions'

afterEach(() => {
  archiveMemberInAudienceMock.mockClear()
  addUserToAudienceMock.mockClear()
  addUserToMarketingAudienceMock.mockClear()
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

    expect(getMailchimpMember).toHaveBeenCalled()
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
      mergeFields: {
        FNAME: undefined,
        LNAME: undefined,
        PL_AMOUNT: 0,
        END_DATE: undefined,
        SUB_STATE: undefined,
        SUB_TYPE: undefined,
        TRIAL: undefined,
        NL_LINK_CA: undefined,
        NL_LINK_WD: undefined,
        NL_DAILY: undefined,
        NL_WEEKLY: undefined,
        NL_PROJ_R: undefined,
        NL_CLIMATE: undefined,
        NL_WDWWW: undefined,
        NL_SUNDAY: undefined,
        NL_ACCOMPL: undefined,
      },
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

  test('user has active trial, no free newsletters', async () => {
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
      subscribeToEditorialNewsletters: true,
      pgdb: pgdb as any,
      name: '',
      subscribed: true,
    })

    expect(addUserToAudience).not.toHaveBeenCalled()
    expect(addUserToMarketingAudience).not.toHaveBeenCalled()

    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })
    expect(archiveMemberInAudience).not.toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_MAIN_LIST_ID,
    })
  })

  test('user has no memberships, active regwall trial', async () => {
    const userId = 'regwalluser'
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
    expect(addUserToMarketingAudience).not.toHaveBeenCalled()

    expect(archiveMemberInAudience).toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_PRODUKTINFOS_AUDIENCE_ID,
    })
    expect(archiveMemberInAudience).not.toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_MAIN_LIST_ID,
    })
  })

  test('user has active or past regwall trial and hence should still get newsletters', async () => {
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
    expect(archiveMemberInAudience).not.toHaveBeenCalledWith({
      user: user,
      audienceId: config.MAILCHIMP_MAIN_LIST_ID,
    })
  })
})
