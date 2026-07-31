// See ../../lib/documentRef.u.jest.js for why these chains are cut.
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
  ensureSignedIn: () => {},
  Roles: {
    userIsInRoles: () => true,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
}))

process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const removeDocumentFromCollection = require('../../../graphql/resolvers/_mutations/removeDocumentFromCollection')

const USER_ID = 'user-1'
const COLLECTION_ID = 'collection-bookmarks'
const LEGACY_REPO_ID = 'republik/article-test'

// Records what any delete would have been scoped to, without running it.
const makeContext = ({ document = null } = {}) => {
  const deletes = []

  return {
    deletes,
    context: {
      req: {},
      user: { id: USER_ID },
      t: (key) => key,
      loaders: {
        Collection: {
          byKeyObj: {
            load: async () => ({ id: COLLECTION_ID, name: 'bookmarks' }),
          },
        },
        Document: {
          byRepoId: {
            load: async (key) => {
              // The real loader rejects a nullish key; a test that let one
              // through would hide exactly the bug below.
              if (!key) {
                throw new Error('invalid key')
              }
              return document
            },
          },
        },
      },
      pgdb: {
        public: {
          collectionDocumentItems: {
            deleteAndGetOne: async (conditions) => {
              deletes.push(conditions)
              return null
            },
          },
        },
      },
    },
  }
}

describe('removeDocumentFromCollection', () => {
  // The regression this guards: getParsedDocumentId returns `repoId: undefined`
  // for "" and for any base64 payload without an "org/repo" in it. That used to
  // reach deleteDocumentItem as an absent ref, contributing no predicate — so
  // the DELETE was scoped to (userId, collectionId) alone and emptied the
  // user's entire bookmarks or progress collection.
  test.each([
    ['an empty id', ''],
    ['base64 that decodes without an org/repo', 'YWJj'],
  ])('404s on %s, deleting nothing', async (_label, documentId) => {
    const { context, deletes } = makeContext()

    await expect(
      removeDocumentFromCollection(
        null,
        { documentId, collectionName: 'bookmarks' },
        context,
      ),
    ).rejects.toThrow('api/collections/document/404')

    expect(deletes).toHaveLength(0)
  })

  test('deletes exactly one document when the id resolves', async () => {
    const { context, deletes } = makeContext({
      document: { meta: { repoId: LEGACY_REPO_ID } },
    })

    await removeDocumentFromCollection(
      null,
      { documentId: LEGACY_REPO_ID, collectionName: 'bookmarks' },
      context,
    )

    expect(deletes).toEqual([
      { userId: USER_ID, collectionId: COLLECTION_ID, repoId: LEGACY_REPO_ID },
    ])
  })

  test('an unresolvable but well-formed id still deletes its own row', async () => {
    // A row whose document no longer exists has to stay deletable, so this path
    // deliberately falls back to the parsed input rather than 404ing.
    const { context, deletes } = makeContext({ document: null })

    await removeDocumentFromCollection(
      null,
      { documentId: LEGACY_REPO_ID, collectionName: 'bookmarks' },
      context,
    )

    expect(deletes).toEqual([
      { userId: USER_ID, collectionId: COLLECTION_ID, repoId: LEGACY_REPO_ID },
    ])
  })
})
