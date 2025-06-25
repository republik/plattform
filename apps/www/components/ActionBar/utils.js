export const getDiscussionLinkProps = (
  linkedDiscussion,
  ownDiscussion,
  template,
) => {
  const discussion = linkedDiscussion || ownDiscussion

  const discussionPath =
    template === 'discussion' ? discussion?.path : `/dialog${discussion?.path}`
  const isDiscussionPage = template === 'discussion'
  const discussionCount = discussion?.comments?.totalCount
  const discussionId = discussion?.id

  return {
    discussionId,
    discussionPath,
    discussionCount,
    isDiscussionPage,
  }
}
