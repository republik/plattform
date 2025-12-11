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

import { SegmentData } from '../../types'
import {
  getMergeFieldsForUser,
  UserMergeFields,
} from './../../lib/getMergeFieldsForUser'

jest.mock('@orbiting/backend-modules-republik/lib/Newsletter', () => ({
  getConsentLink: jest.fn(() => 'getConsentLink mocked'),
}))

describe('test that merge fields are generated correctly from user data with missing/empty input', () => {
  test('user is undefined', async () => {
    const user = undefined as any
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

    const mergeFields = getMergeFieldsForUser({ user, segmentData })
    const expectedResult: UserMergeFields = {
      FNAME: undefined,
      LNAME: undefined,
      PL_AMOUNT: 0,
      END_DATE: undefined,
      SUB_TYPE: undefined,
      SUB_STATE: undefined,
      NL_LINK_CA: undefined,
      NL_LINK_WD: undefined,
      TRIAL: undefined,
      DISCOUNT: undefined,
      REG_TRIAL: undefined,
      NL_DAILY: undefined,
      NL_WEEKLY: undefined,
      NL_PROJ_R: undefined,
      NL_CLIMATE: undefined,
      NL_WDWWW: undefined,
      NL_SUNDAY: undefined,
      NL_ACCOMPL: undefined,
    }
    expect(mergeFields).resolves.toStrictEqual(expectedResult)
  })

  test('user exists, segmentData is empty', async () => {
    const user = {
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'Test',
    }
    const segmentData: SegmentData = {
      pledges: [],
      activeSubscription: undefined,
      invoices: [],
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }

    const mergeFields = getMergeFieldsForUser({ user, segmentData })
    const expectedResult: UserMergeFields = {
      FNAME: 'Test',
      LNAME: 'Test',
      PL_AMOUNT: 0,
      END_DATE: undefined,
      SUB_TYPE: undefined,
      SUB_STATE: undefined,
      NL_LINK_CA: 'getConsentLink mocked',
      NL_LINK_WD: 'getConsentLink mocked',
      TRIAL: undefined,
      DISCOUNT: undefined,
      REG_TRIAL: undefined,
      NL_DAILY: undefined,
      NL_WEEKLY: undefined,
      NL_PROJ_R: undefined,
      NL_CLIMATE: undefined,
      NL_WDWWW: undefined,
      NL_SUNDAY: undefined,
      NL_ACCOMPL: undefined,
    }
    expect(mergeFields).resolves.toStrictEqual(expectedResult)
  })
})

describe('latest pledge amount', () => {
  const userId = 'user-1234'
  const user = {
    id: userId,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'Test ',
  }
  test('no pledges, but active membership', async () => {
    const segmentData: SegmentData = {
      pledges: undefined,
      invoices: undefined,
      activeSubscription: undefined,
      activeMembership: { id: '123-456' } as any,
      activeMembershipPeriod: { id: '234-456', pledgeId: '345-678' } as any,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(0)
  })

  test('pledge from latest active membership', async () => {
    const pledgeId = 'pledge-5678'
    const membershipId = 'm-123'
    const segmentData: SegmentData = {
      pledges: [
        {
          id: pledgeId,
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 27000,
          donation: 0,
          createdAt: new Date('2019-01-01'),
          payload: {},
        },
        {
          id: 'pledge-0987',
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 12000,
          donation: 0,
          createdAt: new Date(),
          payload: {},
        },
      ],
      activeMembership: {
        id: membershipId,
        userId: userId,
        pledgeId: pledgeId,
        membershipTypeId: 'mt-1',
        membershipTypeName: 'ABO',
        createdAt: new Date('2019-01-01'),
        active: true,
        renew: true,
        autoPay: true,
        initialInterval: 'year',
      },
      activeMembershipPeriod: {
        id: 'mp-123',
        pledgeId: pledgeId,
        membershipId: membershipId,
        beginDate: new Date('2019-01-01'),
        endDate: new Date('2035-01-01'),
      },
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
      invoices: [],
      activeSubscription: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(270)
  })

  test('no active membership pledge, amount from latest pledge', async () => {
    const membershipId = 'm-245'
    const segmentData: SegmentData = {
      pledges: [
        {
          id: 'pledge-1084',
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 28000,
          donation: 4000,
          createdAt: new Date('2020-07-09'),
          payload: {},
        },
        {
          id: 'pledge-0987',
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 30000,
          donation: -12000,
          createdAt: new Date('2021-04-03'),
          payload: {},
        },
      ],
      activeMembership: {
        id: membershipId,
        userId: userId,
        pledgeId: 'pledge-10034',
        membershipTypeId: 'mt-1',
        membershipTypeName: 'ABO',
        createdAt: new Date('2019-01-01'),
        active: true,
        renew: true,
        autoPay: true,
        initialInterval: 'year',
      },
      activeMembershipPeriod: {
        id: 'mp-123',
        pledgeId: 'pledge-10034',
        membershipId: membershipId,
        beginDate: new Date('2019-01-01'),
        endDate: new Date('2035-01-01'),
      },
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
      activeSubscription: undefined,
      invoices: [],
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(300)
  })

  test('invoice, no pledges, no active subscription', async () => {
    const segmentData: SegmentData = {
      activeSubscription: undefined,
      invoices: [
        {
          id: '123-456',
          userId: userId,
          subscriptionId: 'sub_123-345',
          total: 700,
          createdAt: new Date('2024-02-01'),
          periodStart: new Date('2024-02-01'),
          periodEnd: new Date('2024-03-01'),
        },
      ],
      pledges: undefined,
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(7)
  })

  test('several invoices, no pledges, active subscription', async () => {
    const segmentData: SegmentData = {
      activeSubscription: { 
        id: 'sub_123-345', 
        userId: userId, 
        type: 'MONTHLY_SUBSCRIPTION', 
        status: 'active', 
        cancelAt: undefined, 
        currentPeriodStart: new Date('2023-02-01'),
        currentPeriodEnd: new Date('2035-01-01')
      },
      invoices: [
        {
          id: '123-456',
          userId: userId,
          subscriptionId: 'sub_123-345',
          total: 700,
          createdAt: new Date('2024-02-01'),
          periodStart: new Date('2024-02-01'),
          periodEnd: new Date('2024-03-01'),
        },
        {
          id: '234-567',
          userId: userId,
          subscriptionId: 'sub_123-345',
          total: 2200,
          createdAt: new Date('2024-03-01'),
          periodStart: new Date('2024-03-01'),
          periodEnd: new Date('2024-04-01'),
        },
      ],
      pledges: undefined,
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(22)
  })

  test('several invoices, a pledge, active subscription', async () => {
    const segmentData: SegmentData = {
      activeSubscription: { 
        id: 'sub_123-345', 
        userId: userId, 
        type: 'MONTHLY_SUBSCRIPTION', 
        status: 'active', 
        cancelAt: undefined, 
        currentPeriodStart: new Date('2023-02-01'),
        currentPeriodEnd: new Date('2035-01-01')
      },
      invoices: [
        {
          id: 'invoice-123-456',
          userId: userId,
          subscriptionId: 'sub_123-345',
          total: 700,
          createdAt: new Date('2024-02-01'),
          periodStart: new Date('2024-02-01'),
          periodEnd: new Date('2024-03-01'),
        },
        {
          id: 'invoice-234-567',
          userId: userId,
          subscriptionId: 'sub_123-345',
          total: 2200,
          createdAt: new Date('2024-03-01'),
          periodStart: new Date('2024-03-01'),
          periodEnd: new Date('2024-04-01'),
        },
      ],
      pledges: [
        {
          id: 'pledge-3456',
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 27000,
          donation: 0,
          createdAt: new Date('2019-01-01'),
          payload: {},
        },
        {
          id: 'pledge-0987',
          packageId: 'package-1234',
          userId: userId,
          status: 'SUCCESSFUL',
          total: 12000,
          donation: 0,
          createdAt: new Date(),
          payload: {},
        },
      ],
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      mailchimpMember: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(22)
  })
})

describe('subscription end date', () => {
  const userId = 'user-1234'
  const user = {
    id: userId,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'Test ',
  }
  const pledgeId = 'pledge-3456'
  const membershipId = 'm-345'
  const segmentData: SegmentData = {
    pledges: [
      {
        id: pledgeId,
        packageId: 'package-1234',
        userId: userId,
        status: 'SUCCESSFUL',
        total: 27000,
        donation: 0,
        createdAt: new Date('2019-01-01'),
        payload: {},
      },
    ],
    activeMembership: {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: true,
      autoPay: true,
      initialInterval: 'year',
    },
    activeMembershipPeriod: undefined,
    activeSubscription: undefined,
    benefactorMembership: undefined,
    accessGrants: [],
    mailchimpMember: undefined,
    invoices: [],
  }
  test('no active membership period or subscription', async () => {
    segmentData.activeMembershipPeriod = undefined
    segmentData.activeSubscription = undefined
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toBeUndefined()
  })

  test('active membership period with missing endDate, no subscription', async () => {
    segmentData.activeMembershipPeriod = {
      id: 'mp-123',
      pledgeId: pledgeId,
      membershipId: membershipId,
      beginDate: new Date('2019-01-01'),
      endDate: undefined as any,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toBeUndefined()
  })

  test('active membership period with end date, no subscription', async () => {
    segmentData.activeMembershipPeriod = {
      id: 'mp-123',
      pledgeId: pledgeId,
      membershipId: membershipId,
      beginDate: new Date('2019-01-01'),
      endDate: new Date('2035-01-01'),
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toStrictEqual(new Date('2035-01-01'))
  })

  test('active subscription, active membership period with end date, subscription takes precedence', async () => {
    segmentData.activeMembershipPeriod = {
      id: 'mp-123',
      pledgeId: pledgeId,
      membershipId: membershipId,
      beginDate: new Date('2019-01-01'),
      endDate: new Date('2035-01-01'),
    }
    segmentData.activeSubscription = {
      id: 'sub-123-567',
      userId: userId,
      type: 'MONTHLY_SUBSCRIPTION',
      status: 'active',
      cancelAt: undefined,
      currentPeriodStart: new Date('2019-01-01'),
      currentPeriodEnd: new Date('2040-01-01')
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toStrictEqual(new Date('2040-01-01'))
  })

  test('active subscription, missing end date, active membership period with end date, subscription takes precedence', async () => {
    segmentData.activeMembershipPeriod = {
      id: 'mp-123',
      pledgeId: pledgeId,
      membershipId: membershipId,
      beginDate: new Date('2019-01-01'),
      endDate: new Date('2035-01-01'),
    }
    segmentData.activeSubscription = {
      id: 'sub-123-567',
      userId: userId,
      type: 'MONTHLY_SUBSCRIPTION',
      status: 'active',
      cancelAt: undefined,
      currentPeriodStart: new Date('2019-01-01'),
      currentPeriodEnd: undefined as any
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toBeUndefined()
  })

  test('active subscription, no active membership period', async () => {
    segmentData.activeMembershipPeriod = undefined
    segmentData.activeSubscription = {
      id: 'sub-123-567',
      userId: userId,
      type: 'MONTHLY_SUBSCRIPTION',
      status: 'active',
      cancelAt: undefined,
      currentPeriodStart: new Date('2019-01-01'),
      currentPeriodEnd: new Date('2041-01-01')
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toStrictEqual(new Date('2041-01-01'))
  })

})

describe('subscription state', () => {
  const userId = 'user-1234'
  const user = {
    id: userId,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'Test ',
  }
  const pledgeId = 'pledge-3456'
  const membershipId = 'm-345'
  const segmentData: SegmentData = {
    pledges: [
      {
        id: pledgeId,
        packageId: 'package-1234',
        userId: userId,
        status: 'SUCCESSFUL',
        total: 27000,
        donation: 0,
        createdAt: new Date('2019-01-01'),
        payload: {},
      },
    ],
    activeMembership: undefined,
    activeMembershipPeriod: undefined,
    benefactorMembership: undefined,
    accessGrants: [],
    mailchimpMember: undefined,
    activeSubscription: undefined,
    invoices: [],
  }
  test('no active membership or subscription defined', async () => {
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBeUndefined()
  })

  test('active membership with autopay, no subscription', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: true,
      autoPay: true,
      initialInterval: 'year',
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Autopay')
  })

  test('active membership, cancelled and autopay, no subscription', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: false,
      autoPay: true,
      initialInterval: 'year',
      cancellationReason: 'dont like',
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Cancelled')
  })

  test('active membership, no autopay, not cancelled, no subscrciption', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: true,
      autoPay: false,
      initialInterval: 'year',
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Active')
  })

  test('cancelled monthly abo, manual cancellation, no subscription', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'MONTHLY_ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: false,
      autoPay: true,
      initialInterval: 'month',
      cancellationReason: 'no time',
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Cancelled')
  })

  test('cancelled monthly abo, cancellation due to change to membership, no subscription', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'MONTHLY_ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: false,
      autoPay: true,
      initialInterval: 'month',
      cancellationReason: 'Auto Cancellation (generateMemberships)',
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Autopay')
  })

  test('active subscription, active membership, subscription takes precedence', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: true,
      autoPay: false,
      initialInterval: 'year',
    }
    segmentData.activeSubscription = {
      id: 'sub-123-456',
      userId: userId,
      type: 'MONTHLY_SUBSCRIPTION',
      status: 'active',
      cancelAt: undefined,
      currentPeriodStart: new Date('2023-05-01'),
      currentPeriodEnd: new Date('2045-01-01')
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Autopay')
  })

  test('cancelled subscription', async () => {
    segmentData.activeMembership = {
      id: membershipId,
      userId: userId,
      pledgeId: pledgeId,
      membershipTypeId: 'mt-1',
      membershipTypeName: 'ABO',
      createdAt: new Date('2019-01-01'),
      active: true,
      renew: true,
      autoPay: false,
      initialInterval: 'year',
    }
    segmentData.activeSubscription = {
      id: 'sub-123-456',
      userId: userId,
      type: 'MONTHLY_SUBSCRIPTION',
      status: 'active',
      cancelAt: new Date('2026-01-01'),
      currentPeriodStart: new Date('2023-05-01'),
      currentPeriodEnd: new Date('2045-01-01')
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Cancelled')
  })
})

describe('trial state', () => {
  const userId = 'user-trial-1223'
  const email = 'user@example.com'
  const user = {
    id: userId,
    email: email,
    firstName: 'Test',
    lastName: 'Test',
  }
  const segmentData: SegmentData = {
    pledges: [],
    activeMembership: undefined,
    activeMembershipPeriod: undefined,
    benefactorMembership: undefined,
    accessGrants: undefined,
    mailchimpMember: undefined,
    activeSubscription: undefined,
    invoices: [],
  }
  test('trial state undefined', async () => {
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.TRIAL).toBeUndefined()
  })

  test('active trial', async () => {
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
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.TRIAL).toBe('Active')
  })

  test('past trial', async () => {
    segmentData.accessGrants = [
      {
        id: 'ag-1234',
        accessCampaignId: 'ac-1',
        granterUserId: userId,
        email: email,
        recipientUserId: userId,
        beginAt: new Date('2020-07-01'),
        endAt: new Date('2020-08-01'),
        revokedAt: new Date('2020-07-05'),
        invalidatedAt: new Date('2020-07-05'),
        payload: {},
      },
    ]
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.TRIAL).toBe('Past')
  })
})

describe('regwall trial state', () => {
  const userId = 'user-trial-1223'
  const email = 'user@example.com'
  const user = {
    id: userId,
    email: email,
    firstName: 'Test',
    lastName: 'Test',
  }
  const segmentData: SegmentData = {
    pledges: [],
    activeMembership: undefined,
    activeMembershipPeriod: undefined,
    benefactorMembership: undefined,
    accessGrants: undefined,
    mailchimpMember: undefined,
    activeSubscription: undefined,
    invoices: [],
  }
  segmentData.accessGrants = [
    {
      id: 'ag-1234',
      accessCampaignId: 'ac-1',
      granterUserId: userId,
      email: email,
      recipientUserId: userId,
      beginAt: new Date('2020-07-01'),
      endAt: new Date('2020-08-01'),
      revokedAt: new Date('2020-07-05'),
      invalidatedAt: new Date('2020-07-05'),
      payload: {},
    },
  ]
  test('no regwal trial, only other trials', async () => {
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.REG_TRIAL).toBeUndefined()
  })

  test('active regwall trial', async () => {
    segmentData.accessGrants = [
      {
        id: 'ag-123',
        accessCampaignId: config.REGWALL_TRIAL_CAMPAIGN_ID,
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
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.REG_TRIAL).toBe('Active')
  })

  test('past regwall trial', async () => {
    segmentData.accessGrants = [
      {
        id: 'ag-1234',
        accessCampaignId: config.REGWALL_TRIAL_CAMPAIGN_ID,
        granterUserId: userId,
        email: email,
        recipientUserId: userId,
        beginAt: new Date('2020-07-01'),
        endAt: new Date('2020-08-01'),
        revokedAt: new Date('2020-07-05'),
        invalidatedAt: new Date('2020-07-05'),
        payload: {},
      },
    ]
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.TRIAL).toBe('Past')
  })
})
