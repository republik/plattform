import { checkRoles } from '@/lib/apollo/withMe'

/**
 * HOTFIX (Sep 2026): For non-members the API clips commenter names in every
 * comment, which blocks its event loop for seconds on discussions with
 * thousands of comments. Until the anonymization is removed, these
 * discussions are neither prefetched nor rendered for non-members.
 */
const MEMBERS_ONLY_DISCUSSION_PATHS = ['/feedback']

export const isDiscussionBlockedFor = (
  discussionPath: string,
  me: unknown,
): boolean =>
  MEMBERS_ONLY_DISCUSSION_PATHS.includes(discussionPath) &&
  !checkRoles(me, ['member'])
