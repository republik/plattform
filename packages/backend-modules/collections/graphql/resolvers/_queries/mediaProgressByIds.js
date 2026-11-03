const Collection = require('../../../lib/Collection')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

const MAX_IDS = 100

// Batch counterpart to `mediaProgress`, for lists that show playback position
// on every row: one entry per input id, in input order, null where there is no
// progress. Every early return has to keep that alignment, hence the
// null-filled arrays.
module.exports = async (_, { mediaIds }, context) => {
  const { user: me } = context

  if (!me) {
    return mediaIds.map(() => null)
  }

  // Same consent gate as `userDocumentProgressByIds`: opting out does not
  // delete existing rows, so reads have to honour it themselves.
  if (await ProgressOptOut.status(me.id, context)) {
    return mediaIds.map(() => null)
  }

  const collection = await Collection.byNameForUser(
    ProgressOptOut.COLLECTION_NAME,
    me.id,
    context,
  )
  if (!collection) {
    return mediaIds.map(() => null)
  }

  // Ids past the cap are answered with null rather than rejected, so the
  // result stays aligned with the input.
  const items = await Collection.findMediaItemsByIds(
    {
      collectionId: collection.id,
      userId: me.id,
      mediaIds: mediaIds.slice(0, MAX_IDS),
    },
    context,
  )
  return mediaIds.map((_, index) => items[index] ?? null)
}
