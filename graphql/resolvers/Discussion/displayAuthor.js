const { displayAuthor: getDisplayAuthor } = require('../Comment')

module.exports = async (discussion, _, { user, pgdb, t }) => {
  if (!user) {
    return null
  }
  return getDisplayAuthor(
    {
      userId: user.id,
      discussionId: discussion.id
    },
    null,
    {
      pgdb,
      t
    }
  )
}
