// Two import chains have to be cut for this to be a *unit* test; both stubs
// keep the code actually under test real.
//
// The sanity package's index re-exports PublishNotificationWorker, which pulls
// in the subscriptions module and its whole GraphQL resolver tree. Deep-require
// the leaf modules that hold the real helpers instead.
jest.mock('@orbiting/backend-modules-sanity', () => ({
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/document.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/legacyId.js'),
}))

// `getParsedDocumentId` comes from the search module, which imports auth at load
// time; that chain ends up validating Mailchimp env vars. Only `transformUser`
// and `Roles` are touched during import, and never called here.
jest.mock('@orbiting/backend-modules-auth', () => ({
  transformUser: (user) => user,
  Roles: {
    userIsInRoles: () => false,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
}))

// The search chain also `checkEnv`s at import time. Set it here rather than
// relying on a developer's .env, so this stays a hermetic unit test.
process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const { inputToColumns, refToColumns } = require('../../lib/documentRef')
const { repoIdToSanityId } = require('@orbiting/backend-modules-sanity')

const LEGACY_REPO_ID = 'republik/article-test'
const SANITY_ID = 'ac4a5196-85bf-56b4-8380-482e02b2dd25'

describe('refToColumns', () => {
  test('a plain ref goes to "repoId" and omits "sanityId"', () => {
    // Omitted, not null: the unused column has to be absent so an insert leaves
    // it NULL and satisfies the one-document-ref check constraint.
    expect(refToColumns(LEGACY_REPO_ID)).toEqual({ repoId: LEGACY_REPO_ID })
  })

  test('a sanity: ref goes to "sanityId" and omits "repoId"', () => {
    expect(refToColumns(`sanity:${SANITY_ID}`)).toEqual({ sanityId: SANITY_ID })
  })

  test('a falsy ref contributes no predicate at all', () => {
    // "not filtering by document", e.g. listing a whole collection.
    expect(refToColumns(undefined)).toEqual({})
  })
})

describe('inputToColumns', () => {
  test('derives the Sanity id from a legacy repoId', () => {
    // The regression this guards: once migrate-legacy-references.ts rewrites a
    // row from "repoId" to "sanityId", a client still holding the legacy repoId
    // must keep finding it. Previously the sanityId candidate was the github
    // path itself, which can never match a uuid column.
    const columns = inputToColumns(LEGACY_REPO_ID)

    expect(columns.repoId).toBe(LEGACY_REPO_ID)
    expect(columns.sanityId).toBe(repoIdToSanityId(LEGACY_REPO_ID))
    expect(columns.sanityId).not.toBe(LEGACY_REPO_ID)
  })

  test('derives the Sanity id from a base64 documentId too', () => {
    const documentId = Buffer.from(
      `${LEGACY_REPO_ID}/commit123/v1`,
    ).toString('base64')

    expect(inputToColumns(documentId)).toEqual({
      repoId: LEGACY_REPO_ID,
      sanityId: repoIdToSanityId(LEGACY_REPO_ID),
    })
  })

  test('keeps a bare Sanity _id as the sanityId candidate', () => {
    // A uuid is not an "owner/repo" path, so the derivation throws and we fall
    // back to the value itself — the two cases are mutually exclusive.
    expect(inputToColumns(SANITY_ID).sanityId).toBe(SANITY_ID)
  })

  test('strips a drafts. prefix', () => {
    expect(inputToColumns(`drafts.${SANITY_ID}`).sanityId).toBe(SANITY_ID)
  })

  test('an explicit sanity: ref needs no guessing', () => {
    expect(inputToColumns(`sanity:${SANITY_ID}`)).toEqual({
      sanityId: SANITY_ID,
    })
  })

  test('does not throw on input that is neither shape', () => {
    expect(() => inputToColumns('not-a-repo-id')).not.toThrow()
  })
})
