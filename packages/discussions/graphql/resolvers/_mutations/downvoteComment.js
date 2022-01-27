const { Roles } = require('@orbiting/backend-modules-auth')
const voteComment = require('../../../lib/voteComment')

module.exports = async (_, args, { pgdb, user, t, pubsub, loaders }) => {
  Roles.ensureUserHasRole(user, 'member')
  const { id } = args
  const vote = -1
  return voteComment(id, vote, pgdb, user, t, pubsub, loaders)
}
