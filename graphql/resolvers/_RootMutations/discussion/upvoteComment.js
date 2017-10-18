const Roles = require('../../../../lib/Roles')
const voteComment = require('./lib/voteComment')

module.exports = async (_, args, { pgdb, user, t, pubsub }) => {
  Roles.ensureUserHasRole(user, 'member')
  const { id } = args
  const vote = 1
  return voteComment(id, vote, pgdb, user, t, pubsub)
}
