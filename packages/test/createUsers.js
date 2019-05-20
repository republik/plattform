const zeroFill = require('zero-fill')

const buildCreateUser = roles => i => ({
  id: `a0000000-0000-0000-0000-${zeroFill(12, i)}`,
  email: `test${i}@republik.ch`,
  roles
})

module.exports = (count, roles) =>
  [...Array(count).keys()].map(buildCreateUser(roles))
