const isUUID = require('is-uuid')

module.exports = async (_, { id }, { pgdb }) =>
  pgdb.public.discussions.findOne(
    isUUID.v4(id)
      ? { id }
      : { repoId: id }
  )
