import { Faker, de_CH, de } from '@faker-js/faker'
import { User, UserRow } from '@orbiting/backend-modules-types'
import { ReferralCodeRepo } from '../lib'
import { generateReferralCode } from '../lib/referralCode'

const faker = new Faker({
  locale: [de_CH, de],
})
const DB: Record<string, any[]> = {
  users: faker.helpers.multiple(mockUserRow, { count: 3 }),
}

describe('generateReferralCode', () => {
  it('generates a random code on each invocation', async () => {
    const user = DB.users.at(0)

    const repo = {
      getReferralCountByReferrerId: jest.fn(() => Promise.resolve(0)),
      getUserByReferralCode: jest.fn(() => Promise.resolve(null)),
      updateUserReferralCode: jest.fn(async (userId, referralCode) => {
        const user = DB.users.find((user) => (user.id = userId))
        if (user) {
          user.referralCode = referralCode
          user._raw.referralCode = referralCode
          return user._raw
        }
        return null
      }),
    }

    const code1 = await generateReferralCode(user, repo)
    const code2 = await generateReferralCode(user, repo)

    expect(code1).not.toBe(code2)
  })
  it('generates a new random code on db error', async () => {
    const user = mockUserRow()
    const generatedCodes: string[] = []
    const repo: ReferralCodeRepo = {
      getReferralCountByReferrerId: jest.fn(() => Promise.resolve(0)),
      getUserByReferralCode: jest.fn(() => Promise.resolve(null)),
      updateUserReferralCode: jest.fn(async (_, code) => {
        generatedCodes.push(code)
        throw Error('referral code collision')
      }),
    }
    const res = await generateReferralCode(user, repo, 5)

    expect(res).toBe(null)
    expect(repo.updateUserReferralCode).toHaveBeenCalledTimes(5)
    expect(generatedCodes.length).toBe(new Set(generatedCodes).size)
  })
  it('max attempts is configurebal', async () => {
    const user = mockUserRow()
    const generatedCodes: string[] = []
    const repo: ReferralCodeRepo = {
      getReferralCountByReferrerId: jest.fn(() => Promise.resolve(0)),
      getUserByReferralCode: jest.fn(() => Promise.resolve(null)),
      updateUserReferralCode: jest.fn(async (_, code) => {
        generatedCodes.push(code)
        throw Error('referral code collision')
      }),
    }
    const ATTEMPTS = 10

    const res = await generateReferralCode(user, repo, ATTEMPTS)

    expect(res).toBe(null)
    expect(repo.updateUserReferralCode).toHaveBeenCalledTimes(ATTEMPTS)
    expect(generatedCodes.length).toBe(new Set(generatedCodes).size)
  })
})

function mockUserRow(): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.firstName()

  const userRow: UserRow = {
    id: faker.string.uuid(),
    name: '',
    firstName: firstName,
    lastName: lastName,
    email: faker.internet.email({ firstName, lastName }),
    roles: [],
    username: faker.internet.userName({ firstName, lastName }),
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
    hasPublicProfile: faker.helpers.arrayElement([true, false]),
    referralCode: null,
    portraitUrl: '',
  }

  return {
    id: userRow.id,
    name: '',
    firstName: userRow.firstName,
    lastName: userRow.lastName,
    email: userRow.email,
    roles: [],
    username: userRow.username,
    initials: userRow.initials,
    hasPublicProfile: userRow.hasPublicProfile,
    referralCode: null,
    portraitUrl: '',
    slug: '',
    _raw: userRow,
  }
}
