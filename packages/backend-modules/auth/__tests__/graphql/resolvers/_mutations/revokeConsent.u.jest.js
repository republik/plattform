jest.mock('check-env')

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
  MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY: 'MAILCHIMP_INTEREST_NEWSLETTER_SUNDAY',
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY: 'MAILCHIMP_INTEREST_NEWSLETTER_DAILY',
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY: 'MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY',
}
jest.mock('@orbiting/backend-modules-mailchimp', () => ({
  getConfig() {
    return config
  },
}))

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
