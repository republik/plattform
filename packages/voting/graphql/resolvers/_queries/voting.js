const { findBySlug } = require('../../../lib/Voting')

module.exports = async (_, { slug }, { pgdb, user: me }) => {
  return findBySlug(slug, pgdb)
}
