const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

const upsert = async (docMeta, context, legacyDiscussionId) => {
  const {
    title,
    path,
    repoId,
    collapsable,
    commentsMaxLength,
    commentsMinInterval,
    discussionAnonymity,
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
    collapsable: !!collapsable,
    ...commentsMaxLength
      ? { maxLength: commentsMaxLength }
      : { },
    ...commentsMinInterval
      ? { minInterval: commentsMinInterval }
      : { },
    ...discussionAnonymity
      ? { anonymity: discussionAnonymity }
      : { },
    tags: tags ? tags.trim().split(',') : null,
    tagRequired: !!tagRequired
  }

  return upsertDiscussion(repoId, settings, context, legacyDiscussionId)
}

module.exports = {
  upsert
}
