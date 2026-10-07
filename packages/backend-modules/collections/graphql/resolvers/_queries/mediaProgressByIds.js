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

  // Each lookup goes through the CollectionMediaItem dataloader, which
  // collapses them into a single query. Ids past the cap are answered with
  // null rather than rejected, so the result stays aligned with the input.
  return Promise.all(
    mediaIds.map((mediaId, index) =>
      index >= MAX_IDS
        ? null
        : Collection.getMediaProgressItem({ mediaId, userId: me.id }, context),
    ),
  ).then((items) => items.map((item) => item || null))
}
