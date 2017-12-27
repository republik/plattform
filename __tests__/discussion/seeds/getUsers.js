const zeroFill = require('zero-fill')

const getUser = i => ({
  id: `a0000000-0000-0000-0000-${zeroFill(12, i)}`,
  email: `test${i}@republik.ch`,
  roles: [ 'member' ]
})

module.exports = count =>
  [...Array(count).keys()].map(getUser)
