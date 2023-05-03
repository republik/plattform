const Collection = require('../../../lib/Collection')

module.exports = async (_, { mediaId }, context) => {
  const { user: me } = context
  if (!me) {
    return
  }
  return Collection.getMediaProgressItem(
    {
      mediaId,
      userId: me.id,
    },
    context,
  )
}
