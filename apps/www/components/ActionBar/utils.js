export const getDiscussionLinkProps = (
  linkedDiscussion,
  ownDiscussion,
  template,
) => {
  const discussion = linkedDiscussion || ownDiscussion

  const isDiscussionPage = template === 'discussion'

  const discussionPath = isDiscussionPage
    ? discussion?.path
    : `/dialog${discussion?.path}`

  const discussionCount = discussion?.comments?.totalCount

  const discussionId = discussion?.closed ? undefined : discussion?.id

  return {
    discussionId,
    discussionPath,
    discussionCount,
    isDiscussionPage,
  }
}
