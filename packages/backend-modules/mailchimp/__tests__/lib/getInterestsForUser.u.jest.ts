const config = {
  MAILCHIMP_INTEREST_MEMBER: 'MAILCHIMP_INTEREST_MEMBER',
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR: 'MAILCHIMP_INTEREST_MEMBER_BENEFACTOR',
  MAILCHIMP_INTEREST_PLEDGE: 'MAILCHIMP_INTEREST_PLEDGE',
  MAILCHIMP_INTEREST_GRANTED_ACCESS: 'MAILCHIMP_INTEREST_GRANTED_ACCESS',
  MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL:
    'MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL',
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR:
    'MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR',
  MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE:
    'MAILCHIMP_INTEREST_NEWSLETTER_CLIMATE',
  MAILCHIMP_INTEREST_NEWSLETTER_WDWWW: 'MAILCHIMP_INTEREST_NEWSLETTER_WDWWW',
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY: 'MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY',
  MAILCHIMP_INTEREST_NEWSLETTER_BAB: 'MAILCHIMP_INTEREST_NEWSLETTER_BAB',
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: 'MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY',
  REGWALL_TRIAL_CAMPAIGN_ID: 'REGWALL_TRIAL_CAMPAIGN_ID',
}
jest.mock('../../config', () => ({
  getConfig() {
    return config
  },
}))

import { SegmentData } from '../../types'
import { getInterestsForUser } from '../../lib/getInterestsForUser'

describe('tests that interests are returned correctly from user data', () => {
  test('has active granted access', async () => {
    const userId = 'user-1234'
    const email = 'user@example.com'
    const user = {
      id: userId,
      email: email,
      firstName: 'Test',
      lastName: 'Test ',
    }
    const segmentData: SegmentData = {
      pledges: [],
      activeSubscription: undefined,
      invoices: undefined,
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    segmentData.accessGrants = [
      {
        id: 'ag-123',
        accessCampaignId: 'ac-1',
        granterUserId: userId,
        email: email,
        recipientUserId: userId,
        beginAt: new Date('2024-07-01'),
        endAt: new Date('2035-01-01'),
        revokedAt: null,
        invalidatedAt: null,
        payload: {},
      },
      {
        id: 'ag-1234',
        accessCampaignId: 'ac-2',
        granterUserId: userId,
        email: email,
        recipientUserId: userId,
        beginAt: new Date('2020-07-01'),
        endAt: new Date('2020-08-01'),
        revokedAt: null,
        invalidatedAt: new Date('2020-07-05'),
        payload: {},
      },
    ]
    const interests = await getInterestsForUser({
      user,
      subscribeToEditorialNewsletters: false,
      segmentData,
    })
    expect(interests[config.MAILCHIMP_INTEREST_MEMBER]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_PLEDGE]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_GRANTED_ACCESS]).toBeTruthy()
    expect(interests[config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_NEWSLETTER_BAB]).toBeFalsy()
  })

  test('has past regwall trial', async () => {
    const userId = 'user-1234'
    const email = 'user@example.com'
    const user = {
      id: userId,
      email: email,
      firstName: 'Test',
      lastName: 'Test ',
    }
    const segmentData: SegmentData = {
      pledges: [],
      activeSubscription: undefined,
      invoices: undefined,
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    segmentData.accessGrants = [
      {
        id: 'ag-1234',
        accessCampaignId: config.REGWALL_TRIAL_CAMPAIGN_ID,
        granterUserId: userId,
        email: email,
        recipientUserId: userId,
        beginAt: new Date('2020-07-01'),
        endAt: new Date('2020-08-01'),
        revokedAt: null,
        invalidatedAt: new Date('2020-07-05'),
        payload: {},
      },
    ]
    const interests = await getInterestsForUser({
      user,
      subscribeToEditorialNewsletters: false,
      segmentData,
    })
    expect(interests[config.MAILCHIMP_INTEREST_MEMBER]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_PLEDGE]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_GRANTED_ACCESS]).toBeFalsy()
    expect(interests[config.MAILCHIMP_INTEREST_PAST_REGWALL_TRIAL]).toBeTruthy()
  })
})
