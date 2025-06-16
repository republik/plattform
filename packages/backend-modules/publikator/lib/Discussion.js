const {
  Discussion: { upsert: upsertDiscussion },
} = require('@orbiting/backend-modules-discussions')

const DEFAULT_ROLES = ['member']

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
    board = null,
    tags,
    tagRequired,
    template,
  } = docMeta

  if (['discussion', 'article'].indexOf(template) === -1) {
    return
  }

  if (!repoId) {
    throw new Error(context.t('api/publish/discussion/repoId/missing'))
  }

  const settings = {
    title,
    path,
    repoId,
    ...(commentsMaxLength ? { maxLength: commentsMaxLength } : {}),
    ...(commentsMinInterval ? { minInterval: commentsMinInterval } : {}),
    ...(discussionAnonymity ? { anonymity: discussionAnonymity } : {}),
    ...(discussionClosed !== null ? { closed: !!discussionClosed } : {}),
    ...(collapsable !== null ? { collapsable: !!collapsable } : {}),
    tags: tags ? tags.trim().split(',') : null,
    tagRequired: !!tagRequired,
    // TODO: get rid of allowedRoles concept in another branche
    allowedRoles: DEFAULT_ROLES,
  }

  return upsertDiscussion(repoId, settings, context, legacyDiscussionId)
}

module.exports = {
  upsert,
}
