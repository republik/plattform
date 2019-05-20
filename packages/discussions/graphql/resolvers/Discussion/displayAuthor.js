const { displayAuthor: getDisplayAuthor } = require('../Comment')

module.exports = async (discussion, _, context) => {
  const { user } = context
  if (!user) {
    return null
  }
  return getDisplayAuthor({ userId: user.id, discussionId: discussion.id }, null, context)
}
