// See documentRef.u.jest.js for why these two chains are cut.
jest.mock('@orbiting/backend-modules-sanity', () => ({
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/document.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/legacyId.js'),
}))

jest.mock('@orbiting/backend-modules-auth', () => ({
  transformUser: (user) => user,
  Roles: {
    userIsInRoles: () => false,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
  // ProgressOptOut.status goes through this; the tests below drive it with a
  // stub `pgdb.public.consents`.
  Consents: {
    lastRecordForPolicyForUser: ({ userId, policy, pgdb }) =>
      pgdb.public.consents.findFirst({ userId, policy }),
  },
}))

process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const {
  upsertItem,
  reorderItems,
  publikatorOnly,
  toRefs,
} = require('../../lib/AudioQueue')

const COLLECTION_ID = 'collection-audioqueue'
const USER_ID = 'user-1'
const SANITY_ID = 'ac4a5196-85bf-56b4-8380-482e02b2dd25'
const OTHER_SANITY_ID = 'bd5b6207-96c0-67c5-9491-593f13c3ee36'

// Builds a context whose pgdb records writes instead of performing them, so the
// column choices and sequence arithmetic can be asserted directly.
const makeContext = (items, { document } = {}) => {
  const inserts = []
  const updates = []
  const deletes = []

  return {
    inserts,
    updates,
    deletes,
    context: {
      user: { id: USER_ID },
      t: (key) => key,
      loaders: {
        Collection: {
          byKeyObj: { load: async () => ({ id: COLLECTION_ID }) },
        },
        Document: {
          byRepoId: { load: async () => document ?? null },
        },
      },
      pgdb: {
        public: {
          collectionDocumentItems: {
            find: async () => items,
            insert: async (row) => inserts.push(row),
            update: async (query, row) => updates.push({ query, row }),
            delete: async (query) => deletes.push(query),
          },
        },
      },
    },
  }
}

// What loaders.Document.byRepoId resolves to — `meta.repoId` is the canonical
// ref, `sanityType` the Sanity `_type` (see documents/loaders/Document.js).
const publikatorDoc = (repoId) => ({
  meta: { repoId },
})
const sanityDoc = (id, sanityType = 'article') => ({
  sanityType,
  meta: { repoId: `sanity:${id}` },
})

describe('publikatorOnly', () => {
  // Every `AudioQueueItem`-typed field and mutation return has to go through
  // this. That type has no sanityId and its `document` is null for Sanity rows,
  // and the web player deletes items it cannot render — so leaking one into a
  // mutation response is enough to have it deleted from the client's cache pass.
  test('drops Sanity-backed rows and keeps publikator ones', () => {
    const items = [
      { id: 'p1', repoId: 'republik/one', sanityId: null },
      { id: 's1', repoId: null, sanityId: SANITY_ID },
    ]

    expect(publikatorOnly(items).map(({ id }) => id)).toEqual(['p1'])
  })
})

describe('toRefs', () => {
  const publikatorRow = () => ({
    id: 'item-publikator',
    repoId: 'republik/one',
    sanityId: null,
    data: { sequence: 1 },
  })
  const sanityRow = () => ({
    id: 'item-sanity',
    repoId: null,
    sanityId: SANITY_ID,
    data: { sequence: 2 },
  })

  // Builds the context toRefs needs: the AudioQueue loader plus a consent row.
  const makeRefContext = ({ items, optOut }) => {
    const cleared = []
    return {
      cleared,
      context: {
        loaders: {
          AudioQueue: {
            byUserId: {
              clear: (key) => cleared.push(key),
              load: async () => items,
            },
          },
        },
        pgdb: {
          public: {
            consents: {
              findFirst: async () => (optOut ? { record: 'GRANT' } : null),
            },
          },
        },
      },
    }
  }

  test('keeps Sanity-backed items, unlike publikatorOnly', async () => {
    const { context } = makeRefContext({
      items: [publikatorRow(), sanityRow()],
      optOut: false,
    })

    const refs = await toRefs(USER_ID, context)

    expect(refs.map(({ id }) => id)).toEqual([
      'item-publikator',
      'item-sanity',
    ])
  })

  test('attaches progressOptOut to every row', async () => {
    // A row missing this flag reads as "not opted out" in
    // AudioQueueItemRef.userProgress, which would serve progress to someone who
    // opted out — so every ref-returning resolver must come through here.
    const { context } = makeRefContext({
      items: [publikatorRow(), sanityRow()],
      optOut: true,
    })

    const refs = await toRefs(USER_ID, context)

    expect(refs.every((ref) => ref.progressOptOut === true)).toBe(true)
  })

  test('does not mutate the loader rows', async () => {
    const items = [sanityRow()]
    const { context } = makeRefContext({ items, optOut: true })

    await toRefs(USER_ID, context)

    expect('progressOptOut' in items[0]).toBe(false)
  })

  test('clears the loader cache before reading', async () => {
    // Callers are mutations returning the queue they just changed; a warm cache
    // would return the pre-mutation state.
    const { context, cleared } = makeRefContext({ items: [], optOut: false })

    await toRefs(USER_ID, context)

    expect(cleared).toEqual([USER_ID])
  })
})

describe('upsertItem', () => {
  test('stores a Sanity document in "sanityId", leaving "repoId" absent', async () => {
    // Absent rather than null, so the one-document-ref check constraint holds.
    const { context, inserts } = makeContext([], {
      document: sanityDoc(SANITY_ID),
    })

    await upsertItem({ entityType: 'Document', entityId: SANITY_ID }, context)

    expect(inserts).toHaveLength(1)
    expect(inserts[0].sanityId).toBe(SANITY_ID)
    expect('repoId' in inserts[0]).toBe(false)
  })

  test('stores a publikator document in "repoId", leaving "sanityId" absent', async () => {
    const { context, inserts } = makeContext([], {
      document: publikatorDoc('republik/article-test'),
    })

    await upsertItem(
      { entityType: 'Document', entityId: 'republik/article-test' },
      context,
    )

    expect(inserts[0].repoId).toBe('republik/article-test')
    expect('sanityId' in inserts[0]).toBe(false)
  })

  test('rejects a Sanity document whose _type is not collectable', async () => {
    // Without this the queue could hold authors, formats or settings singletons:
    // the loader's Sanity branch resolves any _type.
    const { context, inserts } = makeContext([], {
      document: sanityDoc(SANITY_ID, 'page'),
    })

    await expect(
      upsertItem({ entityType: 'Document', entityId: SANITY_ID }, context),
    ).rejects.toThrow('api/collections/audioQueue/error/missingDocument')
    expect(inserts).toHaveLength(0)
  })

  test('rejects a non-collectable type reached via the legacy-rescue path', async () => {
    // The loader's legacy rescue keeps `meta.repoId` as the legacy repoId even
    // though it resolved the document out of Sanity, so a `sanity:`-prefix check
    // would skip validation for exactly these.
    const { context, inserts } = makeContext([], {
      document: {
        sanityType: 'articleCollection',
        meta: { repoId: 'republik/format-test' },
      },
    })

    await expect(
      upsertItem(
        { entityType: 'Document', entityId: 'republik/format-test' },
        context,
      ),
    ).rejects.toThrow('api/collections/audioQueue/error/missingDocument')
    expect(inserts).toHaveLength(0)
  })

  test('re-queueing the same Sanity document moves it instead of duplicating', async () => {
    const existing = {
      id: 'item-sanity',
      repoId: null,
      sanityId: SANITY_ID,
      data: { sequence: 2 },
    }
    const { context, inserts, updates } = makeContext([existing], {
      document: sanityDoc(SANITY_ID),
    })

    await upsertItem({ entityType: 'Document', entityId: SANITY_ID }, context)

    expect(inserts).toHaveLength(0)
    expect(updates.some(({ query }) => query.id === 'item-sanity')).toBe(true)
  })

  test('a publikator row is not mistaken for a Sanity one', async () => {
    // The null-column trap: both rows have a NULL in the column the other uses,
    // so an unguarded `item.sanityId === sanityId` comparison would match.
    const publikatorRow = {
      id: 'item-publikator',
      repoId: 'republik/article-test',
      sanityId: null,
      data: { sequence: 1 },
    }
    const { context, inserts } = makeContext([publikatorRow], {
      document: sanityDoc(SANITY_ID),
    })

    await upsertItem({ entityType: 'Document', entityId: SANITY_ID }, context)

    // A new row, not a move of the unrelated publikator one.
    expect(inserts).toHaveLength(1)
    expect(inserts[0].sanityId).toBe(SANITY_ID)
  })
})

describe('reorderItems', () => {
  const queue = () => [
    { id: 'p1', repoId: 'republik/one', sanityId: null, data: { sequence: 1 } },
    { id: 's1', repoId: null, sanityId: SANITY_ID, data: { sequence: 2 } },
    { id: 'p2', repoId: 'republik/two', sanityId: null, data: { sequence: 3 } },
    {
      id: 's2',
      repoId: null,
      sanityId: OTHER_SANITY_ID,
      data: { sequence: 4 },
    },
  ]

  test('keeps items the caller did not submit', async () => {
    // The regression this guards: the web player hides items it cannot render
    // and then reorders the rest, so deleting the unsubmitted ones would wipe
    // every Sanity-backed item on a single drag.
    const { context, updates, deletes } = makeContext(queue())

    await reorderItems({ ids: ['p2', 'p1'] }, context)

    expect(deletes).toHaveLength(0)

    const sequenceById = Object.fromEntries(
      updates.map(({ query, row }) => [query.id, row.data.sequence]),
    )
    expect(sequenceById).toEqual({ p2: 1, p1: 2, s1: 3, s2: 4 })
  })

  test('assigns a gapless, collision-free sequence', async () => {
    const { context, updates } = makeContext(queue())

    await reorderItems({ ids: ['s2', 'p1'] }, context)

    const sequences = updates.map(({ row }) => row.data.sequence).sort()
    expect(sequences).toEqual([1, 2, 3, 4])
    expect(new Set(sequences).size).toBe(sequences.length)
  })

  test('unsubmitted items keep their prior relative order', async () => {
    const { context, updates } = makeContext(queue())

    await reorderItems({ ids: ['p2'] }, context)

    const sequenceById = Object.fromEntries(
      updates.map(({ query, row }) => [query.id, row.data.sequence]),
    )
    // p1 (was 1), s1 (was 2), s2 (was 4) follow the submitted p2, in that order.
    expect(sequenceById).toEqual({ p2: 1, p1: 2, s1: 3, s2: 4 })
  })

  test('ignores ids that are not in the queue', async () => {
    const { context, updates } = makeContext(queue())

    await reorderItems({ ids: ['nope', 'p1'] }, context)

    expect(updates.map(({ query }) => query.id)).not.toContain('nope')
    expect(updates).toHaveLength(4)
  })
})
