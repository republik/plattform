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
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      newsletterInterests: undefined,
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
      NL_DAILY: undefined,
      NL_WEEKLY: undefined,
      NL_PROJ_R: undefined,
      NL_CLIMATE: undefined,
      NL_WDWWW: undefined,
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
      activeMembership: undefined,
      activeMembershipPeriod: undefined,
      benefactorMembership: undefined,
      accessGrants: [],
      newsletterInterests: undefined,
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
      NL_DAILY: undefined,
      NL_WEEKLY: undefined,
      NL_PROJ_R: undefined,
      NL_CLIMATE: undefined,
      NL_WDWWW: undefined,
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
      activeMembership: { id: '123-456' } as any,
      activeMembershipPeriod: { id: '234-456', pledgeId: '345-678' } as any,
      benefactorMembership: undefined,
      accessGrants: [],
      newsletterInterests: undefined,
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
      newsletterInterests: undefined,
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
      newsletterInterests: undefined,
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.PL_AMOUNT).toBe(300)
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
    benefactorMembership: undefined,
    accessGrants: [],
    newsletterInterests: undefined,
  }
  test('no active membership period', async () => {
    segmentData.activeMembershipPeriod = undefined
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.END_DATE).toBeUndefined()
  })

  test('active membership period with missing endDate', async () => {
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

  test('active membership period with end date', async () => {
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
    newsletterInterests: undefined,
  }
  test('no active membership defined', async () => {
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBeUndefined()
  })

  test('active membership with autopay', async () => {
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

  test('active membership, cancelled and autopay', async () => {
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
    }
    const mergeFields = await getMergeFieldsForUser({ user, segmentData })
    expect(mergeFields.SUB_STATE).toBe('Cancelled')
  })

  test('active membership, no autopay, not cancelled', async () => {
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
    newsletterInterests: undefined,
  }
  test('trial state undefined', async () => {
    const mergeFields = await getMergeFieldsForUser({user, segmentData})
    expect(mergeFields.TRIAL).toBeUndefined()
  })

  test('active trial', async () => {
    segmentData.accessGrants = [{
      id: 'ag-123',
      granterUserId: userId,
      email: email,
      recipientUserId: userId,
      beginAt: new Date('2024-07-01'),
      endAt: new Date('2035-01-01'),
      revokedAt: null,
      invalidatedAt: null,
      payload: {},
    }, {
      id: 'ag-1234',
      granterUserId: userId,
      email: email,
      recipientUserId: userId,
      beginAt: new Date('2020-07-01'),
      endAt: new Date('2020-08-01'),
      revokedAt: null,
      invalidatedAt: new Date('2020-07-05'),
      payload: {},
    }]
    const mergeFields = await getMergeFieldsForUser({user, segmentData})
    expect(mergeFields.TRIAL).toBe('Active')
  })

  test('past trial', async () => {
    segmentData.accessGrants = [{
      id: 'ag-1234',
      granterUserId: userId,
      email: email,
      recipientUserId: userId,
      beginAt: new Date('2020-07-01'),
      endAt: new Date('2020-08-01'),
      revokedAt: new Date('2020-07-05'),
      invalidatedAt: new Date('2020-07-05'),
      payload: {},
    }]
    const mergeFields = await getMergeFieldsForUser({user, segmentData})
    expect(mergeFields.TRIAL).toBe('Past')
  })
})
