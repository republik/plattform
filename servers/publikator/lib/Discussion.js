const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

const upsert = async (docMeta, context, legacyDiscussionId) => {
  const {
    title,
    path,
    repoId,
    commentsMaxLength,
    commentsMinInterval,
    discussionAnonymity,
    discussionClosed = null,
    collapsable = null,
    tags,
    tagRequired
  } = docMeta

  if (!repoId) {
    throw new Error(context.t('api/publish/discussion/repoId/missing'))
  }

  const settings = {
    title,
    path,
    repoId,
    ...commentsMaxLength
      ? { maxLength: commentsMaxLength }
      : { },
    ...commentsMinInterval
      ? { minInterval: commentsMinInterval }
      : { },
    ...discussionAnonymity
      ? { anonymity: discussionAnonymity }
      : { },
    ...discussionClosed !== null
      ? { closed: !!discussionClosed }
      : { },
    ...collapsable !== null
      ? { collapsable: !!collapsable }
      : { },
    tags: tags ? tags.trim().split(',') : null,
    tagRequired: !!tagRequired
  }

  return upsertDiscussion(repoId, settings, context, legacyDiscussionId)
}

module.exports = {
  upsert
}
