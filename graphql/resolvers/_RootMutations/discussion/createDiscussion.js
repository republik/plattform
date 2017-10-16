const Roles = require('../../../../lib/Roles')

module.exports = async (_, args, {pgdb, user, t}) => {
  Roles.ensureUserHasRole(user, 'editor')

  const {
    maxLength,
    minInterval,
    anonymity
  } = args

  const { id } = await pgdb.public.discussions.insertAndGet({
    maxLength,
    minInterval,
    anonymity
  }, {
    skipUndefined: true
  })

  return id
}
