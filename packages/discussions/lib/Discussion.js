const isUUID = require('is-uuid')

// id can be uuid or repoId
// on insert, specified id is not honoured
const upsert = async (id, settings = {}, { pgdb, loaders }, legacyDiscussionId) => {
  let discussion
  const idIsUUID = id && isUUID.v4(id)
  if (id) {
    if (idIsUUID) {
      discussion = await loaders.Discussion.byId.load(id)
    } else {
      discussion = await loaders.Discussion.byRepoId.load(id)
      if (!discussion && legacyDiscussionId) {
        discussion = await loaders.Discussion.byId.load(legacyDiscussionId)
      }
    }
  }

  if (!discussion) {
    discussion = await pgdb.public.discussions.insertAndGet(
      settings,
      { skipUndefined: true }
    )
    if (id) {
      await loaders.Discussion.clear(id)
    }
    if (legacyDiscussionId) {
      await loaders.Discussion.clear(legacyDiscussionId)
    }
  } else {
    if (
      (settings.title && settings.title !== discussion.title) ||
      (settings.maxLength && settings.maxLength !== discussion.maxLength) ||
      (settings.minInterval && settings.minInterval !== discussion.minInterval) ||
      (settings.anonymity && settings.anonymity !== discussion.anonymity) ||
      (
        settings.closed !== undefined &&
        settings.closed !== null &&
        settings.closed !== discussion.closed
      ) ||
      (
        settings.collapsable !== undefined &&
        settings.collapsable !== null &&
        settings.collapsable !== discussion.collapsable
      ) ||
      (settings.tagRequired !== undefined && settings.tagRequired !== discussion.tagRequired) ||
      (settings.tags && settings.tags !== (discussion.tags || []).join(',')) ||
      (!discussion.repoId && id && !idIsUUID && legacyDiscussionId) // to save repoId to existing discussions
    ) {
      discussion = await pgdb.public.discussions.updateAndGetOne(
        { id: discussion.id },
        settings
      )
      await loaders.Discussion.clear(discussion.id)
    }
  }

  return discussion
}

module.exports = {
  upsert
}
