const isUUID = require('is-uuid')

const { DiscussionNotFoundError } = require('./errors')

// id can be uuid or repoId
// on insert, specified id is not honoured
const upsert = async (
  id,
  settings = {},
  { pgdb, loaders },
  legacyDiscussionId,
) => {
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
    discussion = await pgdb.public.discussions.insertAndGet(settings, {
      skipUndefined: true,
    })
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
      (settings.anonymity && settings.anonymity !== discussion.anonymity) ||
      (settings.path && settings.path !== discussion.path) ||
      (settings.closed !== undefined &&
        settings.closed !== null &&
        settings.closed !== discussion.closed) ||
      (settings.collapsable !== undefined &&
        settings.collapsable !== null &&
        settings.collapsable !== discussion.collapsable) ||
      (settings.tagRequired !== undefined &&
        settings.tagRequired !== discussion.tagRequired) ||
      (settings.tags && settings.tags !== (discussion.tags || []).join(',')) ||
      (settings.allowedRoles &&
        settings.allowedRoles !== (discussion.allowedRoles || []).join(',')) ||
      (!discussion.repoId && id && !idIsUUID && legacyDiscussionId) // to save repoId to existing discussions
    ) {
      discussion = await pgdb.public.discussions.updateAndGetOne(
        { id: discussion.id },
        settings,
      )
      await loaders.Discussion.clear(discussion.id)
    }
  }

  return discussion
}

const create = async (
  { title, maxLength, anonymity, tags, tagRequired, closed },
  { pgdb, t },
) => {
  if (tagRequired && (!tags || tags.length === 0)) {
    throw new Error(t('api/discussion/tagRequiredButNoTags'))
  }

  return pgdb.public.discussions.insertAndGet(
    { title, maxLength, anonymity, tags, tagRequired: !!tagRequired, closed },
    { skipUndefined: true },
  )
}

const update = async (
  { id, title, maxLength, anonymity, tags, tagRequired, closed },
  { pgdb, t },
) => {
  const discussion = await pgdb.public.discussions.findOne({ id })
  if (!discussion) {
    throw new DiscussionNotFoundError(t('api/discussion/404'))
  }

  if (tagRequired && !(tags ?? discussion.tags)?.length) {
    throw new Error(t('api/discussion/tagRequiredButNoTags'))
  }

  return pgdb.public.discussions.updateAndGetOne(
    { id },
    { title, maxLength, anonymity, tags, tagRequired, closed },
    { skipUndefined: true },
  )
}

module.exports = {
  upsert,
  create,
  update,
}
