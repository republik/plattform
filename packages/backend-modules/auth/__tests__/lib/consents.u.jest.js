const consents = require('../../lib/Consents')

describe('statusForPolicyForUser:', () => {
  const userId = '12345'
  const policy = 'TOS'

  test('granted', () => {
    const status = { createdAt: '2018-01-01', record: 'GRANT', policy: 'TOS' }
    const pgdb = {
      public: {
        consents: {
          findFirst: jest.fn(() => Promise.resolve(status)),
        },
      },
    }
    expect(
      consents.statusForPolicyForUser({ userId, policy, pgdb }),
    ).resolves.toBeTruthy()
  })

  test('revoked', () => {
    const status = { createdAt: '2018-01-01', record: 'REVOKE', policy: 'TOS' }
    const pgdb = {
      public: {
        consents: {
          findFirst: jest.fn(() => Promise.resolve(status)),
        },
      },
    }
    expect(
      consents.statusForPolicyForUser({ userId, policy, pgdb }),
    ).resolves.toBeFalsy()
  })

  test('undefined', () => {
    const status = {}
    const pgdb = {
      public: {
        consents: {
          findFirst: jest.fn(() => Promise.resolve(status)),
        },
      },
    }
    expect(
      consents.statusForPolicyForUser({ userId, policy, pgdb }),
    ).resolves.toBeFalsy()
  })
})
