// Errors Discussion.create/update raise that a caller may reasonably want to
// branch on. They still carry the translated message, so GraphQL clients see
// no change -- the point is that non-GraphQL callers (e.g. the Sanity express
// handler, which maps failures onto HTTP status codes) can identify the case
// by type instead of string-comparing a message that a translator can edit
// out from under them.
class DiscussionNotFoundError extends Error {}

module.exports = {
  DiscussionNotFoundError,
}
