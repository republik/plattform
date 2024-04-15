jest.mock('check-env')

const revokeConsent = require('../../../../graphql/resolvers/_mutations/revokeConsent')

describe('check revoked consent', () => {
  const req = { user: true, ip: '000.000.000.000' }
  const t = jest.fn(
    (translationString, { consent: name }) => `${translationString}: ${name}`,
  )

  const me = { id: '12345' }

  const grantedConsents = [{ record: 'GRANT', policy: 'TOS' }]
  const pgdb = {
    public: {
      consents: {
        insert: jest.fn(() => Promise.resolve()),
        find: jest.fn(() => Promise.resolve(grantedConsents)),
      },
    },
  }

  test('try revoking irrevokable consent', () => {
    expect(() =>
      revokeConsent(
        undefined,
        { name: 'TOS' },
        { user: me, pgdb: pgdb, req: req, t: t },
      ),
    ).rejects.toThrowError('api/consents/notRevokable: TOS')
  })

  test('revoke revokable consent', () => {
    expect(
      revokeConsent(
        undefined,
        { name: 'PROLITTERIS_OPT_OUT' },
        { user: me, pgdb: pgdb, req: req, t: t },
      ),
    ).resolves.toBe(me)
  })
})
