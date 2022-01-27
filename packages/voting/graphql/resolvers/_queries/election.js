const { findBySlug } = require('../../../lib/Election')

module.exports = async (_, { slug }, { pgdb, user: me }) => {
  return findBySlug(slug, pgdb)
}
