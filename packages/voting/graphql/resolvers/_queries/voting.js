const { findBySlug } = require('../../../lib/Voting')

module.exports = async (_, { slug }, { pgdb }) =>
  findBySlug(slug, pgdb)
