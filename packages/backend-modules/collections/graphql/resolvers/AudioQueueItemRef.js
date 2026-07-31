const { sanityAudioMediaId } = require('@orbiting/backend-modules-sanity')
const {
  COLLECTION_NAME: PROGRESS_COLLECTION_NAME,
} = require('../../lib/ProgressOptOut')

// Both kinds answer `mediaId`, so a client can ask for playback position without
// first branching on which column is set. The publikator derivation mirrors
// publikator/lib/Document.js's audioSource.mediaId; the Sanity one mirrors it in
// turn (see sanity/lib/mediaId.ts).
const mediaIdFor = ({ repoId, sanityId }) => {
  if (sanityId) {
    return sanityAudioMediaId(sanityId)
  }
  return repoId ? Buffer.from(`${repoId}/audio`).toString('base64') : null
}

module.exports = {
  // The AudioQueue loader returns raw rows (no spreadItemData), so `sequence`
  // still lives under `data`.
  sequence: (item) => item.data?.sequence,

  mediaId: mediaIdFor,

  // Same lookup as PlayableMedia.userProgress. `CollectionMediaItem.byKeyObj` is
  // a dataloader, so asking for this on every item in the queue collapses into a
  // single query rather than one per item.
  async userProgress(item, args, context) {
    const { user: me, loaders } = context
    const mediaId = mediaIdFor(item)

    // `progressOptOut` is resolved once by the userAudioQueue resolver and
    // carried on the row — the consent lookup is not batched, so checking it
    // here would cost one query per queue item.
    if (!mediaId || !me || item.progressOptOut) {
      return null
    }

    const collection = await loaders.Collection.byKeyObj.load({
      name: PROGRESS_COLLECTION_NAME,
    })
    if (!collection) {
      return null
    }

    const progress = await loaders.CollectionMediaItem.byKeyObj.load({
      mediaId,
      userId: me.id,
      collectionId: collection.id,
    })

    return progress ? { ...progress, ...progress.data } : null
  },
}
