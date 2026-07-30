const { Roles } = require('@orbiting/backend-modules-auth')
const ProgressOptOut = require('../../../lib/ProgressOptOut')

// Bare refs, no `Document` resolution: Sanity-backed audio has no GraphQL
// `Document`, so clients take `sanityId` from here and fetch title/cover/mp3
// straight from Sanity, while `mediaId` and `userProgress` cover playback
// position.
//
// `User.audioQueue` stays publikator-only — see AudioQueue.publikatorOnly.
module.exports = async (_, args, context) => {
  const { user: me, loaders } = context

  if (!Roles.userIsInRoles(me, ['member'])) {
    return []
  }

  // Already ordered by sequence by the loader.
  const items = await loaders.AudioQueue.byUserId.load(me.id)

  // Resolved once here, not in the per-item `userProgress` resolver: the consent
  // lookup is a plain query (Consents.lastRecordForPolicyForUser is not
  // batched), so a field-level check would cost one query per queue item.
  //
  // Only `userProgress` is suppressed when opted out — the queue itself is not
  // progress data, so it stays readable. Copied onto a new object rather than
  // mutated, so the dataloader's cached rows stay clean.
  const progressOptOut = await ProgressOptOut.status(me.id, context)

  return items.map((item) => ({ ...item, progressOptOut }))
}
