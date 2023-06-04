const voteComment = require('../../../lib/voteComment')

module.exports = async (_, args, { pgdb, user, t, pubsub, loaders }) => {
  return voteComment(args.id, 0, pgdb, user, t, pubsub, loaders)
}
