const crypto = require('crypto')
const shaCompare = require('../shaCompare')
const payPledge = require('../payPledge')

describe('postfinance shaCompare', () => {
  const sig = crypto.createHash('sha1').update('x').digest('hex').toUpperCase()

  it('matches identical signatures only', () => {
    expect(shaCompare(sig, sig)).toBe(true)
    expect(shaCompare(sig.slice(0, -1) + '0', sig)).toBe(false)
    expect(shaCompare(sig.toLowerCase(), sig)).toBe(false)
  })

  it('rejects missing, non-string and wrong-length values without throwing', () => {
    expect(shaCompare(undefined, sig)).toBe(false)
    expect(shaCompare(null, sig)).toBe(false)
    expect(shaCompare(['a'], sig)).toBe(false)
    expect(shaCompare('', sig)).toBe(false)
    expect(shaCompare(sig + 'A', sig)).toBe(false)
    expect(shaCompare(sig.slice(1), sig)).toBe(false)
  })
})

describe('postfinance payPledge signature check', () => {
  const secret = 'secret'
  beforeAll(() => {
    process.env.PF_SHA_OUT_SECRET = secret
  })
  const t = (key) => key
  const logger = { error: jest.fn() }
  const sign = (params) =>
    crypto
      .createHash('sha1')
      .update(
        Object.keys(params)
          .sort((a, b) => a.toUpperCase().localeCompare(b.toUpperCase()))
          .map((k) => `${k.toUpperCase()}=${params[k]}${secret}`)
          .join(''),
      )
      .digest('hex')
      .toUpperCase()

  const run = (pspPayload) =>
    payPledge({
      pledgeId: 'p1',
      total: 1000,
      pspPayload,
      userId: 'u1',
      transaction: {
        public: { payments: { findFirst: jest.fn().mockRejectedValue(new Error('past signature check')) } },
      },
      t,
      logger,
    })

  it('rejects a missing or wrong SHASIGN', async () => {
    const params = { PAYID: '1', STATUS: '9', amount: '10' }
    await expect(run({ ...params })).rejects.toThrow('api/pay/pf/error')
    await expect(run({ ...params, SHASIGN: 'A'.repeat(40) })).rejects.toThrow(
      'api/pay/pf/error',
    )
  })

  it('accepts a correct SHASIGN', async () => {
    const params = { PAYID: '1', STATUS: '9', amount: '10' }
    await expect(run({ ...params, SHASIGN: sign(params) })).rejects.toThrow(
      'past signature check',
    )
  })
})
