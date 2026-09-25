const { isDiscussionBlockedFor } = require('./membersOnlyDiscussions')

const feedback = { id: '1', path: '/feedback' }
const article = { id: '2', path: '/2026/09/25/artikel' }
const member = { id: 'a', roles: ['member'] }
const nonMember = { id: 'b', roles: [] }

test('blocks the feedback discussion for anonymous viewers', () => {
  expect(isDiscussionBlockedFor(feedback, null)).toBe(true)
  expect(isDiscussionBlockedFor(feedback, undefined)).toBe(true)
})

test('blocks the feedback discussion for signed-in non-members', () => {
  expect(isDiscussionBlockedFor(feedback, nonMember)).toBe(true)
})

test('does not block the feedback discussion for members', () => {
  expect(isDiscussionBlockedFor(feedback, member)).toBe(false)
})

test('does not block other discussions', () => {
  expect(isDiscussionBlockedFor(article, null)).toBe(false)
  expect(isDiscussionBlockedFor(null, null)).toBe(false)
})
