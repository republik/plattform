const { find } = require('../../../lib/Questionnaire')

module.exports = async (_, args, { pgdb, user: me }) => {
  return find(pgdb)
}
