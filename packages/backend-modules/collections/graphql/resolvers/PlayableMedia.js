const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../lib/Collection')

module.exports = {
  userProgress({ mediaId }, args, context) {
    const { user: me, req } = context

    ensureSignedIn(req)

    if (!mediaId) {
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
