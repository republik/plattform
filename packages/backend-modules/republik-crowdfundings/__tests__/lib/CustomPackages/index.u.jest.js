const {
  findEligableMemberships,
  findDormantMemberships,
} = require('../../../lib/CustomPackages')

describe('test findEligableMemberships', () => {
  const userId = '12345-12345'
  const user = { id: userId }

  test('empty memberships', () => {
    const memberships = []
    const result = findEligableMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })

  test('test filtering by owner and unclaimed status', () => {
    const eligibleMembership = {
      id: '09876-09876',
      membershipType: { name: 'ABO' },
      userId: userId,
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }
    const userNotOwnerMembership = {
      id: '09876-09875',
      membershipType: { name: 'ABO_GIVE_MONTHS' },
      userId: 'different-user',
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }
    const unclaimedMembership = {
      id: '09876-09874',
      membershipType: { name: 'ABO_GIVE_MONTHS' },
      userId: userId,
      pledge: { package: { isAutoActivateUserMembership: false } },
      voucherCode: 'code',
    }
    const memberships = [
      eligibleMembership,
      userNotOwnerMembership,
      unclaimedMembership,
    ]
    const user = { id: userId }
    const result = findEligableMemberships({ memberships, user })
    expect(result).toContainEqual(eligibleMembership)
    expect(result).toHaveLength(1)
  })
})

describe('test dormant memberships', () => {
  const userId = '12345-12345'
  const user = { id: userId }

  test('empty memberships', () => {
    const memberships = []
    const user = { id: '12345-12345' }
    const result = findEligableMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })

  test('test find dormant membership', () => {
    const dormantMembership = {
      id: '09876-09876',
      active: false,
      periods: [],
      membershipType: { name: 'ABO' },
      userId: userId,
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }

    const memberships = [dormantMembership]
    const result = findDormantMemberships({ memberships, user })
    expect(result).toContainEqual(dormantMembership)
    expect(result).toHaveLength(1)
  })

  test('test find no dormant memberships because membership active', () => {
    const activeMembership = {
      id: '09876-09876',
      active: true,
      periods: [],
      membershipType: { name: 'ABO' },
      userId: userId,
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }

    const memberships = [activeMembership]
    const result = findDormantMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })

  test('test find no dormant memberships because periods exist', () => {
    const activeMembership = {
      id: '09876-09876',
      active: false,
      periods: [{ beginDate: 'some date' }],
      membershipType: { name: 'ABO' },
      userId: userId,
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }

    const memberships = [activeMembership]
    const result = findDormantMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })

  test('test find no dormant memberships because periods undefined', () => {
    const activeMembership = {
      id: '09876-09876',
      active: false,
      periods: undefined,
      membershipType: { name: 'ABO' },
      userId: 'different user',
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }

    const memberships = [activeMembership]
    const result = findDormantMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })

  test('test find no dormant memberships because is not owner', () => {
    const activeMembership = {
      id: '09876-09876',
      active: false,
      periods: [],
      membershipType: { name: 'ABO' },
      userId: 'different user',
      pledge: { package: { isAutoActivateUserMembership: true } },
      voucherCode: undefined,
    }

    const memberships = [activeMembership]
    const result = findDormantMemberships({ memberships, user })
    expect(result).toHaveLength(0)
  })
})
