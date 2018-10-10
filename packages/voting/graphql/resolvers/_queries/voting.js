module.exports = async (_, { slug }, { pgdb }) =>
  pgdb.public.votings.findOne({ slug })
