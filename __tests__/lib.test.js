const test = require('tape-async')
const ensureStringLength = require('../lib/ensureStringLength')

test('ensureStringLength', async (t) => {
  t.throws(() => ensureStringLength('test', { max: 3 }))
  t.throws(() => ensureStringLength('test', { max: 0 }))
  t.throws(() => ensureStringLength('test', { max: -1 }))
  t.doesNotThrow(() => ensureStringLength('test', { max: 4 }))
  t.doesNotThrow(() => ensureStringLength('test', { max: 1000 }))

  t.throws(() => ensureStringLength('test', { min: 5 }))
  t.throws(() => ensureStringLength('test', { min: 1000 }))
  t.doesNotThrow(() => ensureStringLength('test', { min: 4 }))
  t.doesNotThrow(() => ensureStringLength('test', { min: 0 }))
  t.doesNotThrow(() => ensureStringLength('test', { min: -1 }))

  t.doesNotThrow(() => ensureStringLength('test', { max: -1.5, min: -1.5 }), 'floats are ignored')
  t.doesNotThrow(() => ensureStringLength('test', { max: 5, min: 0 }))

  // check implicit empty string throws
  t.doesNotThrow(() => ensureStringLength(null), 'no value is not an error and does not trigger implicit min = 1')
  t.doesNotThrow(() => ensureStringLength(), 'no value is not an error and does not trigger implicit min = 1')
  t.doesNotThrow(() => ensureStringLength('test'))
  t.doesNotThrow(() => ensureStringLength(0))
  t.doesNotThrow(() => ensureStringLength(['test']))
  t.throws(() => ensureStringLength(''), 'empty strings will throw an implicit min = 1 rule if no options')
  t.throws(() => ensureStringLength('', {}), 'empty strings will throw an implicit min = 1 rule if no options')
  t.throws(() => ensureStringLength('', { max: 1 }), 'empty strings will throw an implicit min = 1 rule if not specified')

  t.throws(() => ensureStringLength('test', { max: 3, min: 1, error: 'CUSTOM_ERROR' }, 'CUSTOM_ERROR'))

  t.end()
})
