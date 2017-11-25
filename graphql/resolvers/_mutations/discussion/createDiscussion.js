const Roles = require('../../../../lib/Roles')

module.exports = async (_, args, {pgdb, user, t}) => {
  Roles.ensureUserHasRole(user, 'editor')

  const {
    title,
    maxLength,
    minInterval,
    anonymity
  } = args

  const { id } = await pgdb.public.discussions.insertAndGet({
    title,
    maxLength,
    minInterval,
    anonymity
  }, {
    skipUndefined: true
  })

  return id
}
