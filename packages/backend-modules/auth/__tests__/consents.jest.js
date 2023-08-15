const consents = require('../lib/Consents')

test('allowed consents length', () => {
  expect(consents.VALID_POLICIES).toHaveLength(5)
})
