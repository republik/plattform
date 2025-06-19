jest.mock('check-env')

const {
  statusForPolicyForUser,
  requiredConsents,
  missingConsents,
  ensureAllRequiredConsents,
  saveConsents,
  revokeConsent,
} = require('../../lib/Consents')

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
      statusForPolicyForUser({ userId, policy, pgdb }),
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
      statusForPolicyForUser({ userId, policy, pgdb }),
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
      statusForPolicyForUser({ userId, policy, pgdb }),
    ).resolves.toBeFalsy()
  })
})

describe('required consents:', () => {
  process.env.ENFORCE_CONSENTS = 'PRIVACY'

  test('no userId', async () => {
    const userId = undefined
    const pgdb = {}
    const consents = await requiredConsents({ userId, pgdb })
    expect(consents).toHaveLength(1)
    expect(consents).toContain('PRIVACY')
  })

  test('user has no consents', async () => {
    const userId = '12345'
    const savedConsents = []
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await requiredConsents({ userId, pgdb })
    expect(consents).toHaveLength(1)
    expect(consents).toContain('PRIVACY')
  })

  test('user has required consents', async () => {
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'GRANT', policy: 'PRIVACY' },
      { createdAt: '2020-05-02', record: 'GRANT', policy: 'TOS' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await requiredConsents({ userId, pgdb })
    expect(consents).toHaveLength(0)
  })
})

describe('missing consents:', () => {
  test('user has no consents', async () => {
    const userId = '12345'
    const savedConsents = []
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await missingConsents({
      userId,
      consents: ['TOS'],
      pgdb,
    })
    expect(consents).toHaveLength(1)
    expect(consents).toContain('PRIVACY')
  })

  test('user has only revoked consents', async () => {
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'GRANT', policy: 'PRIVACY' },
      { createdAt: '2020-05-02', record: 'REVOKE', policy: 'PRIVACY' },
      { createdAt: '2020-05-03', record: 'GRANT', policy: 'PRIVACY' },
      { createdAt: '2020-05-04', record: 'REVOKE', policy: 'PRIVACY' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await missingConsents({
      userId,
      consents: ['TOS'],
      pgdb,
    })
    expect(consents).toHaveLength(1)
    expect(consents).toContain('PRIVACY')
  })

  test('user has no consents but consent is passed', async () => {
    const userId = '12345'
    const savedConsents = []
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await missingConsents({
      userId,
      consents: ['PRIVACY'],
      pgdb,
    })
    expect(consents).toHaveLength(0)
  })

  test('user has enforced consent:', async () => {
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'GRANT', policy: 'PRIVACY' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    const consents = await missingConsents({
      userId,
      consents: ['TOS', 'PRIVACY'],
      pgdb,
    })
    expect(consents).toHaveLength(0)
  })

  test('throw if consents are missing', () => {
    const userId = '12345'
    const savedConsents = []
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
        },
      },
    }
    expect(ensureAllRequiredConsents({ userId, pgdb })).rejects.toThrow(
      'Sie müssen folgenden Policies zustimmen um sich anmelden zu können: PRIVACY.',
    )
  })
})

describe('save consents', () => {
  test('user has consent already', () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'GRANT', policy: 'PRIVACY' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
          insert: jest.fn((args) => Promise.resolve(args)),
        },
      },
    }
    expect(
      saveConsents({ userId, consents: ['PRIVACY'], req, pgdb }),
    ).resolves.toHaveLength(0)
  })

  test('successful save', async () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'REVOKE', policy: 'PRIVACY' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
          insert: jest.fn((args) => Promise.resolve(args)),
        },
      },
    }
    const saved = await saveConsents({
      userId,
      consents: ['PRIVACY'],
      req,
      pgdb,
    })
    expect(saved).toHaveLength(1)
    expect(saved).toContainEqual({
      userId: userId,
      policy: 'PRIVACY',
      ip: req.ip,
    })
  })

  test('user has some consents', async () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'REVOKE', policy: 'PRIVACY' },
      { createdAt: '2020-05-02', record: 'GRANT', policy: 'TOS' },
      { createdAt: '2020-05-03', record: 'GRANT', policy: 'STATUTE' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
          insert: jest.fn((args) => Promise.resolve(args)),
        },
      },
    }
    const saved = await saveConsents({
      userId,
      consents: ['PRIVACY', 'TOS', 'PROGRESS_OPT_OUT', 'STATUTE'],
      req,
      pgdb,
    })
    expect(saved).toHaveLength(2)
    expect(saved).toContainEqual({
      userId: userId,
      policy: 'PRIVACY',
      ip: req.ip,
    })
    expect(saved).toContainEqual({
      userId: userId,
      policy: 'PROGRESS_OPT_OUT',
      ip: req.ip,
    })
  })

  test('saving fails because of duplicate', () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const savedConsents = [
      { createdAt: '2020-05-01', record: 'REVOKE', policy: 'PRIVACY' },
    ]
    const pgdb = {
      public: {
        consents: {
          find: jest.fn(() => Promise.resolve(savedConsents)),
          insert: jest.fn((args) => Promise.reject(args)),
        },
      },
    }
    expect(
      saveConsents({ userId, consents: ['PRIVACY'], req, pgdb }),
    ).rejects.toEqual({
      userId: userId,
      policy: 'PRIVACY',
      ip: req.ip,
    })
  })
})

describe('revoke consents', () => {
  test('revoke existing consent', async () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const pgdb = {
      public: {
        consents: {
          insert: jest.fn((args) => Promise.resolve(args)),
        },
      },
    }
    const context = { req: req, pgdb: pgdb }
    const revoke = await revokeConsent({ userId, consent: 'PROGRESS_OPT_OUT' }, context)
    expect(revoke).toBeUndefined()
    expect(pgdb.public.consents.insert).toHaveBeenCalledWith({
      userId,
      policy: 'PROGRESS_OPT_OUT',
      ip: req.ip,
      record: 'REVOKE',
    })
  })

  test('revoking consent fails', async () => {
    const req = { ip: '000.000.000.000' }
    const userId = '12345'
    const pgdb = {
      public: {
        consents: {
          insert: jest.fn((args) => Promise.reject(args)),
        },
      },
    }
    const t = jest.fn((args) => `Translated with ${args}`)
    const context = { req: req, pgdb: pgdb, t: t }
    const revoke = revokeConsent({ userId, consent: 'PROGRESS_OPT_OUT' }, context)
    expect(revoke).rejects.toEqual({
      userId,
      policy: 'PROGRESS_OPT_OUT',
      ip: req.ip,
      record: 'REVOKE',
    })
    expect(pgdb.public.consents.insert).toHaveBeenCalledWith({
      userId,
      policy: 'PROGRESS_OPT_OUT',
      ip: req.ip,
      record: 'REVOKE',
    })
  })
})
