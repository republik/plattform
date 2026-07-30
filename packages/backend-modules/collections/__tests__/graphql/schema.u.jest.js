// See ../lib/documentRef.u.jest.js for why these chains are cut.
jest.mock('@orbiting/backend-modules-sanity', () => ({
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/document.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/legacyId.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/mediaId.js'),
}))

jest.mock('@orbiting/backend-modules-auth', () => ({
  transformUser: (user) => user,
  Roles: {
    userIsInRoles: () => false,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
  ensureSignedIn: () => {},
}))

process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const fs = require('fs')
const path = require('path')
const { parse } = require('graphql')

const schema = require('../../graphql/schema')
const schemaTypes = require('../../graphql/schema-types')

const RESOLVERS_DIR = path.join(__dirname, '../../graphql/resolvers')

// Types/interfaces this module declares, plus `extend type X` blocks — the
// latter is how it hangs fields off Document, User and PlayableMedia, which are
// owned by other modules.
const fieldsByType = () => {
  const doc = parse(schema + schemaTypes)
  const map = new Map()
  for (const def of doc.definitions) {
    if (!def.name || !def.fields) continue
    const name = def.name.value
    const fields = map.get(name) ?? new Set()
    for (const field of def.fields) fields.add(field.name.value)
    map.set(name, fields)
  }
  return map
}

describe('collections SDL', () => {
  test('parses', () => {
    expect(() => parse(schema + schemaTypes)).not.toThrow()
  })

  test.each([
    'DocumentProgressRef',
    'AudioQueueItemRef',
    'CollectionItemRef',
    'CollectionItemRefConnection',
  ])('declares %s', (typeName) => {
    expect(fieldsByType().has(typeName)).toBe(true)
  })

  test.each([
    'userDocumentProgress',
    'userDocumentProgressByIds',
    'userCollectionItemsByNames',
    'userAudioQueue',
    'userCollectionItems',
    'userCollectionItem',
    'userCollectionItemsByIds',
  ])('declares the %s query', (queryName) => {
    expect(fieldsByType().get('queries').has(queryName)).toBe(true)
  })
})

describe('resolvers line up with the SDL', () => {
  // makeExecutableSchema throws on a resolver for a field the schema doesn't
  // declare, which otherwise only surfaces when the whole API boots.
  const resolverFiles = fs
    .readdirSync(RESOLVERS_DIR)
    .filter((file) => file.endsWith('.js'))

  test('there is at least one, so a bad glob cannot vacuously pass', () => {
    expect(resolverFiles.length).toBeGreaterThan(0)
  })

  test.each(resolverFiles)('%s', (file) => {
    const typeName = path.basename(file, '.js')
    const declared = fieldsByType().get(typeName)

    // Every non-root resolver file must correspond to a type this module
    // declares or extends.
    expect(declared).toBeDefined()

    for (const field of Object.keys(require(path.join(RESOLVERS_DIR, file)))) {
      expect(declared).toContain(field)
    }
  })
})

describe('root query resolvers exist for every declared query', () => {
  test.each([
    'userDocumentProgress',
    'userDocumentProgressByIds',
    'userCollectionItemsByNames',
    'userAudioQueue',
  ])('%s', (queryName) => {
    const resolver = require(path.join(
      RESOLVERS_DIR,
      '_queries',
      `${queryName}.js`,
    ))
    expect(typeof resolver).toBe('function')
  })
})

describe('ref-returning audio queue mutations', () => {
  const REF_MUTATIONS = [
    'addAudioQueueItemRef',
    'moveAudioQueueItemRef',
    'removeAudioQueueItemRef',
    'reorderAudioQueueRefs',
    'clearAudioQueueRefs',
  ]

  test.each(REF_MUTATIONS)('%s is declared', (name) => {
    expect(fieldsByType().get('mutations').has(name)).toBe(true)
  })

  test.each(REF_MUTATIONS)('%s has a resolver', (name) => {
    const resolver = require(path.join(RESOLVERS_DIR, '_mutations', `${name}.js`))
    expect(typeof resolver).toBe('function')
  })

  test.each(REF_MUTATIONS)('%s returns AudioQueueItemRef', (name) => {
    const field = parse(schema + schemaTypes)
      .definitions.find((def) => def.name?.value === 'mutations')
      .fields.find((f) => f.name.value === name)

    // Unwrap [AudioQueueItemRef!]!
    expect(JSON.stringify(field.type)).toContain('AudioQueueItemRef')
  })

  test.each([
    'addAudioQueueItem',
    'moveAudioQueueItem',
    'removeAudioQueueItem',
    'reorderAudioQueue',
    'clearAudioQueue',
  ])('%s is deprecated in favour of its ref counterpart', (name) => {
    const field = parse(schema + schemaTypes)
      .definitions.find((def) => def.name?.value === 'mutations')
      .fields.find((f) => f.name.value === name)

    const deprecated = field.directives.find(
      (d) => d.name.value === 'deprecated',
    )
    expect(deprecated).toBeDefined()
  })
})
