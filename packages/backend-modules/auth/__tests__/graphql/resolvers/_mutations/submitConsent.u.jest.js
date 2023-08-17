const submitConsent = require('../../../../graphql/resolvers/_mutations/submitConsent')

describe('check submitted consent', () => {
  const req = { user: true, ip: '000.000.000' }
  const t = jest.fn(
    (translationString, { consent: name }) => `Translated: ${name}`,
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

  test('submit invalid consent', () => {
    expect(() =>
      submitConsent(
        undefined,
        { name: 'RANDOM_CONSENT' },
        { user: undefined, pgdb: pgdb, req: req, t: t },
      ),
    ).rejects.toThrow(Error)
  })

  test('submit valid consent', () => {
    expect(
      submitConsent(
        undefined,
        { name: 'TOS' },
        { user: me, pgdb: pgdb, req: req, t: t },
      ),
    ).resolves.toBe(me)
  })
})
