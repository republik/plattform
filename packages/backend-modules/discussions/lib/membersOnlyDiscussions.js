const Roles = require('@orbiting/backend-modules-auth/lib/Roles')

/**
 * HOTFIX (Sep 2026): For non-members every comment's text runs through the
 * name clipper, which blocks the event loop for seconds on discussions with
 * thousands of commenters. Until the anonymization is removed, the comments
 * of these discussions are not served to non-members at all.
 */
const MEMBERS_ONLY_DISCUSSION_PATHS = ['/feedback']

const isDiscussionBlockedFor = (discussion, me) =>
  MEMBERS_ONLY_DISCUSSION_PATHS.includes(discussion?.path) &&
  !Roles.userIsInRoles(me, ['member'])

module.exports = { isDiscussionBlockedFor }
