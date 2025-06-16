export const getDiscussionLinkProps = (
  linkedDiscussion,
  ownDiscussion,
  template,
  path,
) => {
  const isActiveLinkedDiscussion =
    linkedDiscussion &&
    (template === 'article' || template === 'page') &&
    (!linkedDiscussion?.closed || linkedDiscussion?.comments.totalCount > 0)

  const isActiveOwnDiscussion =
    !isActiveLinkedDiscussion &&
    (!ownDiscussion?.closed || ownDiscussion?.comments?.totalCount > 0)

  const isArticleAutoDiscussion =
    isActiveOwnDiscussion && template === 'article'

  const isDiscussionPage = isActiveOwnDiscussion && template === 'discussion'

  const discussionCount =
    (isActiveLinkedDiscussion && linkedDiscussion?.comments.totalCount) ||
    (isActiveOwnDiscussion && ownDiscussion?.comments?.totalCount) ||
    undefined

  const discussionId =
    (isActiveLinkedDiscussion && linkedDiscussion.id) ||
    (isActiveOwnDiscussion && ownDiscussion.id) ||
    undefined

  const discussionPath =
    (isActiveLinkedDiscussion && linkedDiscussion.path) ||
    (isArticleAutoDiscussion && `/dialog${path}`) ||
    (isDiscussionPage && path) ||
    undefined

  return {
    discussionId,
    discussionPath,
    discussionCount,
    isDiscussionPage,
  }
}
