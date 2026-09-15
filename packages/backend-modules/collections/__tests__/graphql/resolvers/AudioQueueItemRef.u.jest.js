// See ../../lib/documentRef.u.jest.js for why these chains are cut.
jest.mock('@orbiting/backend-modules-sanity', () => ({
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/document.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/legacyId.js'),
  ...jest.requireActual('@orbiting/backend-modules-sanity/build/lib/mediaId.js'),
}))

jest.mock('@orbiting/backend-modules-auth', () => ({
  transformUser: (user) => user,
  Roles: {
    userIsInRoles: () => true,
    userIsMe: () => false,
    ensureUserHasRole: () => {},
  },
}))

process.env.FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:3010'

const AudioQueueItemRef = require('../../../graphql/resolvers/AudioQueueItemRef')
const { sanityAudioMediaId } = require('@orbiting/backend-modules-sanity')

const USER_ID = 'user-1'
const SANITY_ID = 'ac4a5196-85bf-56b4-8380-482e02b2dd25'

const sanityItem = (extra = {}) => ({
  id: 'item-sanity',
  repoId: null,
  sanityId: SANITY_ID,
  data: { sequence: 2 },
  ...extra,
})

const publikatorItem = (extra = {}) => ({
  id: 'item-publikator',
  repoId: 'republik/article-test',
  sanityId: null,
  data: { sequence: 1 },
  ...extra,
})

// Counts loader calls so the batching claim on `userProgress` can be asserted.
const makeContext = (progressRow) => {
  const mediaItemKeys = []
  return {
    mediaItemKeys,
    context: {
      user: { id: USER_ID },
      loaders: {
        Collection: {
          byKeyObj: { load: async () => ({ id: 'collection-progress' }) },
        },
        CollectionMediaItem: {
          byKeyObj: {
            load: async (key) => {
              mediaItemKeys.push(key)
              return progressRow ?? null
            },
          },
        },
      },
    },
  }
}

describe('mediaId', () => {
  test('derives from sanityId for a Sanity item', () => {
    expect(AudioQueueItemRef.mediaId(sanityItem())).toBe(
      sanityAudioMediaId(SANITY_ID),
    )
  })

  test('mirrors the publikator derivation for a publikator item', () => {
    // Must match publikator/lib/Document.js's audioSource.mediaId, or the same
    // audio would store progress under two different keys.
    expect(AudioQueueItemRef.mediaId(publikatorItem())).toBe(
      Buffer.from('republik/article-test/audio').toString('base64'),
    )
  })

  test('is null when neither column is set', () => {
    expect(
      AudioQueueItemRef.mediaId({ repoId: null, sanityId: null }),
    ).toBeNull()
  })
})

describe('sequence', () => {
  test('reads through data, which the AudioQueue loader does not spread', () => {
    expect(AudioQueueItemRef.sequence(sanityItem())).toBe(2)
  })
})

describe('userProgress', () => {
  test('returns the progress row with data flattened', async () => {
    const { context } = makeContext({
      id: 'progress-1',
      mediaId: sanityAudioMediaId(SANITY_ID),
      data: { secs: 42 },
    })

    const progress = await AudioQueueItemRef.userProgress(
      sanityItem(),
      {},
      context,
    )

    expect(progress.secs).toBe(42)
  })

  test('looks up by the item mediaId, scoped to the user and progress collection', async () => {
    const { context, mediaItemKeys } = makeContext(null)

    await AudioQueueItemRef.userProgress(sanityItem(), {}, context)

    expect(mediaItemKeys).toEqual([
      {
        mediaId: sanityAudioMediaId(SANITY_ID),
        userId: USER_ID,
        collectionId: 'collection-progress',
      },
    ])
  })

  test('is null and does no lookup when the user opted out of progress', async () => {
    // The flag is resolved once by the userAudioQueue resolver, because the
    // consent lookup is not batched.
    const { context, mediaItemKeys } = makeContext({
      id: 'progress-1',
      data: { secs: 42 },
    })

    const progress = await AudioQueueItemRef.userProgress(
      sanityItem({ progressOptOut: true }),
      {},
      context,
    )

    expect(progress).toBeNull()
    expect(mediaItemKeys).toHaveLength(0)
  })

  test('is null for an anonymous caller', async () => {
    const { context } = makeContext({ id: 'progress-1', data: { secs: 1 } })
    context.user = null

    await expect(
      AudioQueueItemRef.userProgress(sanityItem(), {}, context),
    ).resolves.toBeNull()
  })

  test('is null when there is no progress recorded', async () => {
    const { context } = makeContext(null)

    await expect(
      AudioQueueItemRef.userProgress(sanityItem(), {}, context),
    ).resolves.toBeNull()
  })
})
