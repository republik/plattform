export const getDiscussionLinkProps = (
  linkedDiscussion,
  ownDiscussion,
  template,
  path,
) => {
  const isLinkedDiscussion =
    linkedDiscussion &&
    (template === 'article' || template === 'page') &&
    (!linkedDiscussion.closed ||
      (linkedDiscussion.comments && linkedDiscussion.comments.totalCount > 0))
  const isOwnDiscussion =
    !isLinkedDiscussion &&
    ownDiscussion &&
    (!ownDiscussion.closed ||
      (ownDiscussion.comments && ownDiscussion.comments.totalCount > 0))
  const isArticleAutoDiscussion = isOwnDiscussion && template === 'article'
  const isDiscussionPage = isOwnDiscussion && template === 'discussion'
  const discussionCount =
    (isLinkedDiscussion &&
      linkedDiscussion.comments &&
      linkedDiscussion.comments.totalCount) ||
    (isOwnDiscussion &&
      ownDiscussion.comments &&
      ownDiscussion.comments.totalCount) ||
    undefined

  const discussionId =
    (isLinkedDiscussion && linkedDiscussion.id) ||
    (isOwnDiscussion && ownDiscussion.id) ||
    undefined
  const discussionPath =
    (isLinkedDiscussion && linkedDiscussion.path) ||
    (isArticleAutoDiscussion && '/dialog') ||
    (isDiscussionPage && path) ||
    undefined
  const discussionQuery = isArticleAutoDiscussion
    ? { id: ownDiscussion.id }
    : undefined

  return {
    discussionId,
    discussionPath,
    discussionQuery,
    discussionCount,
    isDiscussionPage,
  }
}
