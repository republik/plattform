import { ReferralCodeRepo } from '../lib'
import { generateReferralCode } from '../lib/referralCode'

const DB: Record<string, any[]> = {
  users: [],
}

describe('generateReferralCode', () => {
  it('generates a random code on each invocation', async () => {
    const user = mockUserRow()
    DB.users.push(user)

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
  it('generates new random codes on collision', async () => {
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
    const res = await generateReferralCode(user, repo)

    expect(res).toBe(null)
    expect(repo.updateUserReferralCode).toHaveBeenCalledTimes(25)
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

function mockUserRow() {
  return {
    id: 'foo-bar-baz',
    name: '',
    firstName: 'Max',
    lastName: 'Musterfrau',
    email: 'max-musterman@example.com',
    roles: [],
    username: '',
    initials: 'MM',
    hasPublicProfile: false,
    referralCode: null,
    portraitUrl: '',
    slug: '',
    _raw: {
      id: 'foo-bar-baz',
      name: '',
      firstName: 'Max',
      lastName: 'Musterfrau',
      email: 'max-musterman@example.com',
      roles: [],
      username: '',
      initials: 'MM',
      hasPublicProfile: false,
      referralCode: null,
      portraitUrl: '',
    },
  }
}
