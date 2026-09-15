const getSubscriptionsForUserAndObjects = jest.fn().mockResolvedValue([])
const getUsersWithSubscriptions = jest.fn().mockResolvedValue([])

jest.mock('@orbiting/backend-modules-subscriptions', () => ({
  Subscriptions: {
    getSubscriptionsForUserAndObjects: (...args: unknown[]) =>
      getSubscriptionsForUserAndObjects(...args),
    getUsersWithSubscriptions: (...args: unknown[]) =>
      getUsersWithSubscriptions(...args),
  },
}))

import { resolveNotificationRecipients } from '../article'
import { legacySanityId } from '../document'

describe('resolveNotificationRecipients', () => {
  // resolveNotificationRecipients also checks for legacy repoId-keyed
  // subscriptions (see resolveLegacyRepoIdsForSanityIds) via a direct
  // pgdb.query — these tests aren't exercising that fallback, so return no
  // rows and let it no-op.
  const pgdb = { query: jest.fn().mockResolvedValue([]) }

  beforeEach(() => {
    getSubscriptionsForUserAndObjects.mockClear()
    getUsersWithSubscriptions.mockClear()
    pgdb.query.mockClear().mockResolvedValue([])
  })

  it('prefixes articleCollection ids with "sanity:" before looking up Document subscriptions', async () => {
    await resolveNotificationRecipients(
      {
        _id: 'article-1',
        articleCollections: [
          { collection: { _id: 'abc123' } },
          { collection: { _id: 'drafts.def456' } },
          { collection: null },
        ],
        contributors: [{ contributor: { userId: 'user-1' } }],
      },
      { pgdb },
    )

    const documentCall = getSubscriptionsForUserAndObjects.mock.calls.find(
      (call) => call[1].type === 'Document',
    )
    expect(documentCall[1].ids).toEqual(['sanity:abc123', 'sanity:def456'])
  })

  it('leaves author userIds untouched', async () => {
    await resolveNotificationRecipients(
      {
        _id: 'article-1',
        articleCollections: [],
        contributors: [
          { contributor: { userId: 'user-1' } },
          { contributor: null },
        ],
      },
      { pgdb },
    )

    const userCall = getSubscriptionsForUserAndObjects.mock.calls.find(
      (call) => call[1].type === 'User',
    )
    expect(userCall[1].ids).toEqual(['user-1'])
  })

  it("also matches subscriptions still keyed on a migrated collection's legacy repoId", async () => {
    const migratedRepoId = 'republik/format-x'
    const migratedSanityId = legacySanityId(migratedRepoId) as string
    pgdb.query.mockResolvedValueOnce([
      { objectDocumentId: migratedRepoId },
      { objectDocumentId: 'republik/some-other-repo' }, // must NOT match
    ])

    await resolveNotificationRecipients(
      {
        _id: 'article-1',
        articleCollections: [{ collection: { _id: migratedSanityId } }],
        contributors: [],
      },
      { pgdb },
    )

    const documentCall = getSubscriptionsForUserAndObjects.mock.calls.find(
      (call) => call[1].type === 'Document',
    )
    expect(documentCall[1].ids).toEqual(
      expect.arrayContaining([`sanity:${migratedSanityId}`, migratedRepoId]),
    )
    expect(documentCall[1].ids).not.toContain('republik/some-other-repo')
    expect(documentCall[1].ids).toHaveLength(2)
  })
})
