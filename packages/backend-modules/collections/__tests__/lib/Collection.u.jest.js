// See documentRef.u.jest.js for why these chains are cut.
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
    expect(captured.sql).toContain("percentage")
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
