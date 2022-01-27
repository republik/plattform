const { find } = require('../../../lib/Election')

module.exports = async (_, args, { pgdb, user: me }) => {
  return find(pgdb)
}
