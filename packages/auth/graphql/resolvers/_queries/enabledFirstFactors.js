const { enabledFirstFactors } = require('../../../lib/Users')

module.exports = async (_, { email }, { pgdb }) => {
  return enabledFirstFactors(email, pgdb)
}
