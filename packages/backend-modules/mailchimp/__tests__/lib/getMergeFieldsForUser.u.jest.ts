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
    const mergeFields = await getMergeFieldsForUser({user, segmentData})
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
    const mergeFields = await getMergeFieldsForUser({user, segmentData})
    expect(mergeFields.PL_AMOUNT).toBe(300)
  })
})
