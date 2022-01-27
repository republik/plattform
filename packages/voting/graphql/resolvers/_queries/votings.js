const { find } = require('../../../lib/Voting')

module.exports = async (_, args, { pgdb, user: me }) => {
  return find(pgdb)
}
