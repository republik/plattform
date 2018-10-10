const { find } = require('../../../lib/Voting')

module.exports = async (_, args, { pgdb }) =>
  find(pgdb)
