const ensureStringLength = require('./ensureStringLength')

describe('ensureStringLength', () => {
  const testString = 'test';

  [3, 0, -1].forEach(max => {
    test(`throws because "${testString}" is longer than ${max}`, () => {
      expect(() => ensureStringLength(testString, { max })).toThrow()
    })
  });

  [4, 1000].forEach(max => {
    test(`doesn't throws because "${testString}" is not longer than ${max}`, () => {
      expect(() => ensureStringLength(testString, { max })).not.toThrow()
    })
  });

  [5, 1000].forEach(min => {
    test(`throws because "${testString}" is shorter than ${min}`, () => {
      expect(() => ensureStringLength(testString, { min })).toThrow()
    })
  });

  [4, 0, -1].forEach(min => {
    test(`doesn't throws because "${testString}" is not shorter than ${min}`, () => {
      expect(() => ensureStringLength(testString, { min })).not.toThrow()
    })
  })

  test(`in range`, () => {
    expect(() => ensureStringLength(testString, { min: 1, max: 4 })).not.toThrow()
    expect(() => ensureStringLength(testString, { min: -1, max: 40 })).not.toThrow()
  })

  test(`float range`, () => {
    expect(() => ensureStringLength(testString, { min: 1.6, max: 4.1 })).not.toThrow()
    expect(() => ensureStringLength(testString, { min: 1.6, max: 3.9 })).toThrow()
  })

  test('no value is not an error and does not trigger default min = 1', () => {
    expect(() => ensureStringLength(null).not.toThrow())
    expect(() => ensureStringLength().not.toThrow())
    expect(() => ensureStringLength('test').not.toThrow())
    expect(() => ensureStringLength(0).not.toThrow())
    expect(() => ensureStringLength(['test']).not.toThrow())
  })

  test('empty strings will throw an default min = 1 rule if no options', () => {
    expect(() => ensureStringLength('').toThrow())
    expect(() => ensureStringLength('', {}).toThrow())
  })

  test('empty strings will throw an default min = 1 rule if not specified', () => {
    expect(() => ensureStringLength('', { max: 1 }).toThrow())
  })

  test('custom error', () => {
    expect(() => ensureStringLength(testString, { min: 1, max: 3, error: 'CUSTOM_ERROR' }).toThrow('CUSTOM_ERROR'))
  })
})
