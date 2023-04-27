const Collection = require('../../lib/Collection')

module.exports = {
  userProgress({ mediaId }, args, context) {
    const { user: me } = context

    if (!mediaId || !me) {
      return
    }

    return Collection.getMediaProgressItem(
      {
        mediaId,
        userId: me.id,
      },
      context,
    )
  },
}
