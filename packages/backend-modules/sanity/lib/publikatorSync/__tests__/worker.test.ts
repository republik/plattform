const createOrReplace = jest.fn()
const deleteDoc = jest.fn().mockResolvedValue(undefined)
const getDocument = jest.fn()

jest.mock('../../client', () => ({
  sanityClient: () => ({
    createOrReplace,
    delete: deleteDoc,
    getDocument,
  }),
}))

jest.mock('../articleDoc', () => ({
  buildDraftArticleDoc: (commit: { id: string }) => ({
    _type: 'article',
    _syncedFromCommitId: commit.id,
  }),
}))

jest.mock('../assets', () => ({
  resolveAssetMarkers: (doc: unknown) => Promise.resolve(doc),
}))

const linkLegacySyntheticAudio = jest
  .fn()
  .mockImplementation((doc: unknown) => Promise.resolve(doc))

jest.mock('../legacyAudio', () => ({
  linkLegacySyntheticAudio: (...args: unknown[]) =>
    linkLegacySyntheticAudio(...args),
}))

const linkLegacyDiscussion = jest.fn().mockResolvedValue(undefined)

jest.mock('../discussionRef', () => ({
  linkLegacyDiscussion: (...args: unknown[]) => linkLegacyDiscussion(...args),
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PublikatorSyncWorker } = require('../worker')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { repoIdToSanityId } = require('../../legacyId')

function makeWorker(pgdb: Record<string, unknown>, isTemplate = false) {
  const findOne = jest.fn().mockResolvedValue({ meta: { isTemplate } })
  return new PublikatorSyncWorker({}, { error: jest.fn(), warn: jest.fn() }, {
    pgdb: {
      ...pgdb,
      publikator: {
        ...(pgdb.publikator as Record<string, unknown>),
        repos: { findOne },
      },
    },
  } as never)
}

describe('PublikatorSyncWorker', () => {
  beforeEach(() => {
    createOrReplace.mockReset()
    deleteDoc.mockReset().mockResolvedValue(undefined)
    getDocument.mockReset()
    linkLegacySyntheticAudio
      .mockReset()
      .mockImplementation((doc: unknown) => Promise.resolve(doc))
    linkLegacyDiscussion.mockReset().mockResolvedValue(undefined)
  })

  it('commit: syncs the latest commit for the repo, not the one in the payload', async () => {
    const findOne = jest.fn().mockResolvedValue({
      id: 'newest',
      repoId: 'republik/foo',
      meta: { template: 'article' },
    })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      { data: { $version: 'v1', repoId: 'republik/foo', action: 'commit' } },
    ])

    expect(findOne).toHaveBeenCalledWith(
      { repoId: 'republik/foo' },
      { orderBy: { createdAt: 'desc' }, limit: 1 },
    )
    expect(createOrReplace).toHaveBeenCalledTimes(1)
    expect(deleteDoc).not.toHaveBeenCalled()
    const [written] = createOrReplace.mock.calls[0]
    expect(written._syncedFromCommitId).toBe('newest')
    expect(written._id).toMatch(/^drafts\./)
  })

  it('commit: skips a format/section/page/front/template commit', async () => {
    const findOne = jest.fn().mockResolvedValue({
      id: 'c1',
      repoId: 'republik/format-x',
      meta: { template: 'format' },
    })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      {
        data: { $version: 'v1', repoId: 'republik/format-x', action: 'commit' },
      },
    ])

    expect(createOrReplace).not.toHaveBeenCalled()
  })

  it('commit: skips when the repo itself is flagged isTemplate, even if the commit meta looks like an article', async () => {
    // isTemplate lives on publikator.repos.meta, not on the commit row —
    // this is the case publish.js can't gate on itself (no isTemplate arg),
    // so the worker must catch it.
    const findOne = jest.fn().mockResolvedValue({
      id: 'c1',
      repoId: 'republik/vorlage-x',
      meta: { template: 'article' },
    })
    const worker = makeWorker(
      { publikator: { commits: { findOne } } },
      /* isTemplate */ true,
    )

    await worker.perform([
      {
        data: {
          $version: 'v1',
          repoId: 'republik/vorlage-x',
          action: 'commit',
        },
      },
    ])

    expect(createOrReplace).not.toHaveBeenCalled()
  })

  it('publish: syncs the exact commitId from the payload, then best-effort deletes the draft', async () => {
    const findOne = jest
      .fn()
      .mockResolvedValue({ id: 'c42', repoId: 'republik/foo', meta: {} })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      {
        data: {
          $version: 'v1',
          repoId: 'republik/foo',
          commitId: 'c42',
          action: 'publish',
        },
      },
    ])

    expect(findOne).toHaveBeenCalledWith({
      id: 'c42',
      repoId: 'republik/foo',
    })
    expect(createOrReplace).toHaveBeenCalledTimes(1)
    const [published] = createOrReplace.mock.calls[0]
    expect(published._syncedFromCommitId).toBe('c42')
    expect(published._id).not.toMatch(/^drafts\./)

    // published doc write happens before the draft cleanup, and as two
    // separate calls (not one atomic transaction) — see worker.ts's
    // deleteIfExists comment for why.
    expect(deleteDoc).toHaveBeenCalledWith(`drafts.${published._id}`)
    expect(createOrReplace.mock.invocationCallOrder[0]).toBeLessThan(
      deleteDoc.mock.invocationCallOrder[0],
    )
  })

  it('publish: the published doc still gets written even if the draft cleanup delete fails', async () => {
    deleteDoc.mockRejectedValueOnce(new Error('not found'))
    const findOne = jest
      .fn()
      .mockResolvedValue({ id: 'c42', repoId: 'republik/foo', meta: {} })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await expect(
      worker.perform([
        {
          data: {
            $version: 'v1',
            repoId: 'republik/foo',
            commitId: 'c42',
            action: 'publish',
          },
        },
      ]),
    ).resolves.toBeUndefined()

    expect(createOrReplace).toHaveBeenCalledTimes(1)
  })

  it('unpublish: only touches an already-`article`-typed published document', async () => {
    getDocument.mockResolvedValue({ _id: 'x', _type: 'page', title: 'nope' })
    const worker = makeWorker({})

    await worker.perform([
      {
        data: {
          $version: 'v1',
          repoId: 'republik/some-page',
          action: 'unpublish',
        },
      },
    ])

    expect(createOrReplace).not.toHaveBeenCalled()
  })

  it('unpublish: moves an article-typed published doc back to drafts, then best-effort deletes the published one', async () => {
    // getDocument is fetched BY the computed id, so a realistic mock's own
    // _id matches it — asserting against a different literal here would
    // just be testing an unrealistic fixture, not the worker's behavior.
    const publishedId = repoIdToSanityId('republik/foo')
    getDocument.mockResolvedValue({
      _id: publishedId,
      _type: 'article',
      _rev: 'r1',
      title: 'Hello',
    })
    const worker = makeWorker({})

    await worker.perform([
      { data: { $version: 'v1', repoId: 'republik/foo', action: 'unpublish' } },
    ])

    expect(createOrReplace).toHaveBeenCalledTimes(1)
    const [draft] = createOrReplace.mock.calls[0]
    expect(draft._id).toBe(`drafts.${publishedId}`)
    expect(draft.title).toBe('Hello')
    expect(deleteDoc).toHaveBeenCalledWith(publishedId)
  })

  it('commit: still syncs the article when legacy audio linking throws', async () => {
    // A transient Sanity/Postgres hiccup in the audio side-channel must
    // never block the article's own text/content from syncing.
    linkLegacySyntheticAudio.mockRejectedValueOnce(new Error('sanity down'))
    const findOne = jest.fn().mockResolvedValue({
      id: 'c1',
      repoId: 'republik/foo',
      meta: { template: 'article' },
    })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await expect(
      worker.perform([
        { data: { $version: 'v1', repoId: 'republik/foo', action: 'commit' } },
      ]),
    ).resolves.toBeUndefined()

    expect(createOrReplace).toHaveBeenCalledTimes(1)
    const [written] = createOrReplace.mock.calls[0]
    expect(written._syncedFromCommitId).toBe('c1')
  })

  it('publish: merges the linked discussion reference into the published doc', async () => {
    linkLegacyDiscussion.mockResolvedValueOnce({
      _type: 'reference',
      _ref: 'discussion-1',
    })
    const findOne = jest
      .fn()
      .mockResolvedValue({ id: 'c42', repoId: 'republik/foo', meta: {} })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      {
        data: {
          $version: 'v1',
          repoId: 'republik/foo',
          commitId: 'c42',
          action: 'publish',
        },
      },
    ])

    expect(linkLegacyDiscussion).toHaveBeenCalledWith(
      expect.anything(),
      'republik/foo',
      expect.any(String),
    )
    const [published] = createOrReplace.mock.calls[0]
    expect(published.discussion).toEqual({
      _type: 'reference',
      _ref: 'discussion-1',
    })
  })

  it('publish: omits the discussion field entirely when no legacy discussion exists', async () => {
    linkLegacyDiscussion.mockResolvedValueOnce(undefined)
    const findOne = jest
      .fn()
      .mockResolvedValue({ id: 'c42', repoId: 'republik/foo', meta: {} })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      {
        data: {
          $version: 'v1',
          repoId: 'republik/foo',
          commitId: 'c42',
          action: 'publish',
        },
      },
    ])

    const [published] = createOrReplace.mock.calls[0]
    expect('discussion' in published).toBe(false)
  })

  it('publish: still syncs the article when legacy discussion linking throws', async () => {
    linkLegacyDiscussion.mockRejectedValueOnce(new Error('sanity down'))
    const findOne = jest
      .fn()
      .mockResolvedValue({ id: 'c42', repoId: 'republik/foo', meta: {} })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await expect(
      worker.perform([
        {
          data: {
            $version: 'v1',
            repoId: 'republik/foo',
            commitId: 'c42',
            action: 'publish',
          },
        },
      ]),
    ).resolves.toBeUndefined()

    expect(createOrReplace).toHaveBeenCalledTimes(1)
    const [published] = createOrReplace.mock.calls[0]
    expect('discussion' in published).toBe(false)
  })

  it('commit: never attempts to link a discussion (publish-only)', async () => {
    const findOne = jest.fn().mockResolvedValue({
      id: 'newest',
      repoId: 'republik/foo',
      meta: { template: 'article' },
    })
    const worker = makeWorker({ publikator: { commits: { findOne } } })

    await worker.perform([
      { data: { $version: 'v1', repoId: 'republik/foo', action: 'commit' } },
    ])

    expect(linkLegacyDiscussion).not.toHaveBeenCalled()
  })
})
