jest.mock('check-env')

const membershipResolver = require('../../../graphql/resolvers/Membership')

describe('check if autopay is mutable on membership', () => {
  const { autoPayIsMutable } = membershipResolver
  test('check autopay is not mutable due to membership type', () => {
    const membershipType = { autoPayMutable: false }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is mutable due to membership type', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(true)
  })

  test('check autopay is not mutable when membership is not active', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: false, renew: true }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is not mutable when membership is not set to renew', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: true, renew: false }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })

  test('check autopay is not mutable when membership is not active and not set to renew', () => {
    const membershipType = { autoPayMutable: true }
    membershipResolver.type = jest.fn(() => Promise.resolve(membershipType))

    const membership = { active: false, renew: false }

    const result = autoPayIsMutable(membership, null, null)

    expect(result).resolves.toBe(false)
  })
})
