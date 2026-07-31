// See documentRef.u.jest.js for why these chains are cut.
jest.mock('@orbiting/backend-modules-sanity', () => ({
  ...jest.requireActual(
    '@orbiting/backend-modules-sanity/build/lib/document.js',
  ),
  ...jest.requireActual(
    '@orbiting/backend-modules-sanity/build/lib/legacyId.js',
  ),
}))

jest.mock('@orbiting/backend-modules-auth', () => ({
  transformUser: (user) => user,
  Roles: {
    userIsInRoles: () => false,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
}))

process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const Collection = require('../../lib/Collection')

// Captures the SQL instead of running it, so the conditional interpolation can
// be asserted without a database.
const captureQuery = () => {
  const captured = {}
  return {
    captured,
    context: {
      pgdb: {
        query: async (sql, params) => {
          captured.sql = sql
          captured.params = params
          return []
        },
      },
    },
  }
}

// Records the conditions each write is scoped to, so "which rows would this
// have touched?" can be asserted without a database.
const captureItemTable = () => {
  const calls = []
  return {
    calls,
    context: {
      pgdb: {
        public: {
          collectionDocumentItems: {
            find: async (conditions) => {
              calls.push(['find', conditions])
              return []
            },
            findOne: async (conditions) => {
              calls.push(['findOne', conditions])
              return null
            },
            deleteAndGetOne: async (conditions) => {
              calls.push(['deleteAndGetOne', conditions])
              return null
            },
          },
        },
      },
    },
  }
}

describe('single-item operations refuse an absent documentRef', () => {
  // The regression this guards: an unparsable documentId used to reach
  // deleteDocumentItem as `undefined`, which contributed no predicate — so the
  // DELETE was scoped to (userId, collectionId) and emptied the user's whole
  // bookmarks or progress collection. pgdb runs the DELETE before it notices it
  // matched more than one row, so the error came too late to help.
  test('deleteDocumentItem throws and issues no query', async () => {
    const { calls, context } = captureItemTable()

    await expect(
      Collection.deleteDocumentItem(
        'user-1',
        'collection-1',
        undefined,
        context,
      ),
    ).rejects.toThrow('documentRef is required')

    expect(calls).toHaveLength(0)
  })

  test('upsertDocumentItem throws and issues no query', async () => {
    const { calls, context } = captureItemTable()

    await expect(
      Collection.upsertDocumentItem(
        'user-1',
        'collection-1',
        undefined,
        {},
        context,
      ),
    ).rejects.toThrow('documentRef is required')

    expect(calls).toHaveLength(0)
  })

  test('but listing a whole collection still works', async () => {
    // findDocumentItems is the one legitimate "no document filter" caller.
    const { calls, context } = captureItemTable()

    await Collection.findDocumentItems(
      { collectionId: 'collection-1', userId: 'user-1' },
      context,
    )

    expect(calls).toEqual([
      ['find', { collectionId: 'collection-1', userId: 'user-1' }],
    ])
  })
})

describe('findDocumentItemsByCollectionNames', () => {
  test('filters to publikator rows by default', async () => {
    // `User.collectionItems` relies on this: its `document` field must resolve.
    const { captured, context } = captureQuery()

    await Collection.findDocumentItemsByCollectionNames(
      { names: ['bookmarks'], userId: 'user-1' },
      context,
    )

    expect(captured.sql).toContain('"repoId" IS NOT NULL')
  })

  test('includeSanity drops only that filter', async () => {
    const { captured, context } = captureQuery()

    await Collection.findDocumentItemsByCollectionNames(
      {
        names: ['bookmarks', 'progress'],
        userId: 'user-1',
        progress: 'UNFINISHED',
        includeSanity: true,
      },
      context,
    )

    expect(captured.sql).not.toContain('IS NOT NULL')
    // The progress self-join has to survive, and stay NULL-safe on both columns
    // — exactly one is set per row, so `=` would never match.
    expect(captured.sql).toContain('IS NOT DISTINCT FROM')
    expect(captured.sql).toContain('"sanityId" IS NOT DISTINCT FROM')
    expect(captured.sql).toContain('percentage')
  })

  test('the progress join is omitted when no progress filter is asked for', async () => {
    const { captured, context } = captureQuery()

    await Collection.findDocumentItemsByCollectionNames(
      { names: ['bookmarks'], userId: 'user-1', includeSanity: true },
      context,
    )

    expect(captured.sql).not.toContain('progress_item')
  })

  test('lastDays adds a date bound', async () => {
    const { captured, context } = captureQuery()

    await Collection.findDocumentItemsByCollectionNames(
      { names: ['bookmarks'], userId: 'user-1', lastDays: 30 },
      context,
    )

    expect(captured.sql).toContain('"updatedAt" >= :afterDate')
  })
})
