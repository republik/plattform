const { findBySlug } = require('../../../lib/Questionnaire')

module.exports = async (_, { slug }, { pgdb, user: me }) => {
  return findBySlug(slug, pgdb)
}
