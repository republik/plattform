const { sanityAudioMediaId } = require('@orbiting/backend-modules-sanity')

module.exports = {
  // The AudioQueue loader returns raw rows (no spreadItemData), so `sequence`
  // still lives under `data`.
  sequence: (item) => item.data?.sequence,

  // Both kinds answer this field, so a client can ask for playback position
  // without first branching on which column is set. The publikator derivation
  // mirrors publikator/lib/Document.js's audioSource.mediaId; the Sanity one
  // mirrors it in turn (see sanity/lib/mediaId.ts).
  mediaId: ({ repoId, sanityId }) => {
    if (sanityId) {
      return sanityAudioMediaId(sanityId)
    }
    return repoId
      ? Buffer.from(`${repoId}/audio`).toString('base64')
      : null
  },
}
