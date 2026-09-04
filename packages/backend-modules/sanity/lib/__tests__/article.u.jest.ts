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

describe('resolveNotificationRecipients', () => {
  beforeEach(() => {
    getSubscriptionsForUserAndObjects.mockClear()
    getUsersWithSubscriptions.mockClear()
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
      {},
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
      {},
    )

    const userCall = getSubscriptionsForUserAndObjects.mock.calls.find(
      (call) => call[1].type === 'User',
    )
    expect(userCall[1].ids).toEqual(['user-1'])
  })
})
