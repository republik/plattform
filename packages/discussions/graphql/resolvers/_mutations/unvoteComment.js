const { Roles } = require('@orbiting/backend-modules-auth')
const voteComment = require('../../../lib/voteComment')

module.exports = async (_, args, { pgdb, user, t, pubsub, loaders }) => {
  Roles.ensureUserHasRole(user, 'member')
  return voteComment(args.id, 0, pgdb, user, t, pubsub, loaders)
}
