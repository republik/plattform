const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

const upsert = async (docMeta, context) => {
  const {
    title,
    path,
    repoId,
    collapsable,
    commentsMaxLength,
    commentsMinInterval,
    discussionAnonymity
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
      : { }
  }

  return upsertDiscussion(repoId, settings, context)
}

module.exports = {
  upsert
}
