module.exports = async (_, { id }, { pgdb }) =>
  pgdb.public.discussions.findOne({ id })
