const patch = jest.fn()
const fetch = jest.fn()
const loggerError = jest.fn()

jest.mock('../client', () => ({
  sanityClient: () => ({ patch, fetch }),
}))

jest.mock('@orbiting/backend-modules-logger', () => ({
  logger: { error: (...args: unknown[]) => loggerError(...args) },
}))

// withReleaseUnlock has its own dedicated test suite (releaseLock.u.jest.ts) —
// mocked here as a passthrough so these tests exercise only withDraftSync's
// own not-found-fallback/mirror-to-draft logic, not the lock guard's internals.
jest.mock('../releaseLock', () => ({
  withReleaseUnlock: (
    _client: unknown,
    _documentId: string,
    mutate: () => unknown,
  ) => mutate(),
}))

import {
  claimAudioGeneration,
  hasPendingVersion,
  markPendingVersionError,
  recordAudioVersion,
  reportAudioGenerationError,
  reportAudioGenerationSuccess,
} from '../audio'

const notFoundError = () =>
  Object.assign(new Error('not found'), {
    details: { items: [{ error: { type: 'documentNotFoundError' } }] },
  })

// Generic chainable patch-builder shared by the fallback/mirror tests below —
// every method (however many a given call site chains) just returns the same
// object so `.commit()` can be configured last. Each call to chainable()
// makes an independent object/mock set, so per-id chains (e.g. one for the
// version id, one for the draft id) can be asserted on separately.
function chainable(commit: jest.Mock) {
  const obj: Record<string, jest.Mock> & { commit: jest.Mock } = { commit }
  const proxy = new Proxy(obj, {
    get(target, prop: string) {
      if (prop in target) return target[prop]
      const fn = jest.fn(() => proxy)
      target[prop] = fn
      return fn
    },
  })
  return proxy
}

describe('hasPendingVersion', () => {
  it('is false when nothing is pending', () => {
    expect(hasPendingVersion(undefined, 'hash-1')).toBe(false)
    expect(hasPendingVersion([], 'hash-1')).toBe(false)
  })

  it('is false when a pending entry exists for a different hash', () => {
    expect(
      hasPendingVersion(
        [{ contentHash: 'hash-2', generatedAt: new Date().toISOString() }],
        'hash-1',
      ),
    ).toBe(false)
  })

  it('is true for a fresh pending entry matching the hash', () => {
    expect(
      hasPendingVersion(
        [{ contentHash: 'hash-1', generatedAt: new Date().toISOString() }],
        'hash-1',
      ),
    ).toBe(true)
  })

  it('is false for a matching entry older than 72h (abandoned run)', () => {
    const seventyThreeHoursAgo = new Date(
      Date.now() - 73 * 60 * 60 * 1000,
    ).toISOString()
    expect(
      hasPendingVersion(
        [{ contentHash: 'hash-1', generatedAt: seventyThreeHoursAgo }],
        'hash-1',
      ),
    ).toBe(false)
  })

  it('treats a matching entry with no generatedAt as not stale (never expires)', () => {
    expect(hasPendingVersion([{ contentHash: 'hash-1' }], 'hash-1')).toBe(true)
  })
})

describe('claimAudioGeneration', () => {
  const ifRevisionId = jest.fn()
  const setIfMissing = jest.fn()
  const insert = jest.fn()
  const set = jest.fn()
  const commit = jest.fn()

  beforeEach(() => {
    loggerError.mockReset()
    patch.mockReset().mockReturnValue({ ifRevisionId })
    ifRevisionId.mockReset().mockReturnValue({ setIfMissing })
    setIfMissing.mockReset().mockReturnValue({ insert })
    insert.mockReset().mockReturnValue({ set })
    set.mockReset().mockReturnValue({ commit })
    commit.mockReset()
  })

  it('returns true when the revision-guarded patch commits', async () => {
    commit.mockResolvedValue(undefined)

    const claimed = await claimAudioGeneration('drafts.doc-1', 'rev-1', 'hash-1')

    expect(claimed).toBe(true)
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(patch).toHaveBeenCalledTimes(1)
    expect(ifRevisionId).toHaveBeenCalledWith('rev-1')
    expect(setIfMissing).toHaveBeenCalledWith({ audioVersions: [] })
    expect(insert).toHaveBeenCalledWith(
      'after',
      'audioVersions[-1]',
      [
        expect.objectContaining({
          _type: 'audioVersion',
          status: 'pending',
          contentHash: 'hash-1',
        }),
      ],
    )
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        audioGenerationResult: expect.objectContaining({ status: 'in-progress' }),
      }),
    )
  })

  it('returns false on a 409 revision conflict (a sibling request already claimed it)', async () => {
    commit.mockRejectedValue(
      Object.assign(new Error('conflict'), { statusCode: 409 }),
    )

    const claimed = await claimAudioGeneration('drafts.doc-1', 'rev-1', 'hash-1')

    expect(claimed).toBe(false)
  })

  it('rethrows any other error', async () => {
    commit.mockRejectedValue(new Error('network error'))

    await expect(
      claimAudioGeneration('drafts.doc-1', 'rev-1', 'hash-1'),
    ).rejects.toThrow('network error')
  })

  it('falls back to the draft (without the revision guard) when the version no longer exists', async () => {
    const failingChain = chainable(jest.fn().mockRejectedValue(notFoundError()))
    const succeedingChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? failingChain : succeedingChain,
    )

    const claimed = await claimAudioGeneration(
      'versions.r1.doc-1',
      'rev-1',
      'hash-1',
    )

    expect(claimed).toBe(true)
    // ifRevisionId only makes sense against the original id — rev has
    // nothing to do with the draft's own revision.
    expect(failingChain.ifRevisionId).toHaveBeenCalledWith('rev-1')
    expect(succeedingChain.ifRevisionId).not.toHaveBeenCalled()
    expect(succeedingChain.commit).toHaveBeenCalledWith({
      autoGenerateArrayKeys: true,
    })
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'versions.r1.doc-1',
        draftId: 'drafts.doc-1',
      }),
      expect.stringContaining('falling back to the draft'),
    )
  })

  it('also mirrors the claim onto the draft when the primary write (against a version id) succeeds', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    const claimed = await claimAudioGeneration(
      'versions.r1.doc-1',
      'rev-1',
      'hash-1',
    )

    expect(claimed).toBe(true)
    expect(patch).toHaveBeenCalledWith('versions.r1.doc-1')
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(versionChain.ifRevisionId).toHaveBeenCalledWith('rev-1')
    expect(draftChain.ifRevisionId).not.toHaveBeenCalled()
    expect(versionChain.commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
    expect(draftChain.commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
    expect(loggerError).not.toHaveBeenCalled()
  })

  it('does not mirror onto the draft when documentId already is the draft', async () => {
    commit.mockResolvedValue(undefined)

    await claimAudioGeneration('drafts.doc-1', 'rev-1', 'hash-1')

    expect(patch).toHaveBeenCalledTimes(1)
  })

  it('still reports a successful claim when the mirror write to the draft fails', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockRejectedValue(new Error('mirror boom')))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    const claimed = await claimAudioGeneration(
      'versions.r1.doc-1',
      'rev-1',
      'hash-1',
    )

    expect(claimed).toBe(true)
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'versions.r1.doc-1',
        draftId: 'drafts.doc-1',
      }),
      expect.stringContaining('failed to mirror'),
    )
  })
})

describe('markPendingVersionError', () => {
  const set = jest.fn()
  const commit = jest.fn()

  beforeEach(() => {
    loggerError.mockReset()
    patch.mockReset().mockReturnValue({ set })
    set.mockReset().mockReturnValue({ commit })
    commit.mockReset().mockResolvedValue(undefined)
  })

  it('patches only the matching pending entry\'s status/error sub-fields', async () => {
    await markPendingVersionError('drafts.doc-1', 'hash-1', new Error('boom'))

    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(patch).toHaveBeenCalledTimes(1)
    const path = 'audioVersions[contentHash == "hash-1" && status == "pending"]'
    expect(set).toHaveBeenCalledWith({
      [`${path}.status`]: 'error',
      [`${path}.error`]: 'boom',
    })
    expect(commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
  })

  it('stringifies a non-Error value', async () => {
    await markPendingVersionError('drafts.doc-1', 'hash-1', 'plain string error')

    const path = 'audioVersions[contentHash == "hash-1" && status == "pending"]'
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ [`${path}.error`]: 'plain string error' }),
    )
  })

  it('falls back to the draft when the version no longer exists', async () => {
    const failingChain = chainable(jest.fn().mockRejectedValue(notFoundError()))
    const succeedingChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? failingChain : succeedingChain,
    )

    await markPendingVersionError('versions.r1.doc-1', 'hash-1', new Error('boom'))

    expect(succeedingChain.commit).toHaveBeenCalledWith({
      autoGenerateArrayKeys: true,
    })
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ draftId: 'drafts.doc-1' }),
      expect.stringContaining('falling back to the draft'),
    )
  })

  it('also mirrors onto the draft when the primary write (against a version id) succeeds', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    await markPendingVersionError('versions.r1.doc-1', 'hash-1', new Error('boom'))

    expect(patch).toHaveBeenCalledWith('versions.r1.doc-1')
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(versionChain.commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
    expect(draftChain.commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
    expect(loggerError).not.toHaveBeenCalled()
  })
})

describe('recordAudioVersion', () => {
  const version = {
    file: { _type: 'file' as const, asset: { _type: 'reference' as const, _ref: 'asset-1' } },
    url: 'https://example.com/audio.mp3',
    generatedAt: '2026-09-21T00:00:00.000Z',
  }

  beforeEach(() => {
    loggerError.mockReset()
    fetch.mockReset().mockResolvedValue(undefined)
  })

  it('appends the version and sets current fields when there is no pending placeholder', async () => {
    const commit = jest.fn().mockResolvedValue(undefined)
    const chain = chainable(commit)
    patch.mockReset().mockReturnValue(chain)

    await recordAudioVersion('drafts.doc-1', { audioSourceMp3: 'url' }, version, 'hash-1')

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: 'drafts.doc-1', hash: 'hash-1' },
      { perspective: 'raw' },
    )
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(patch).toHaveBeenCalledTimes(1)
    expect(chain.set).toHaveBeenCalledWith({ audioSourceMp3: 'url' })
    expect(chain.setIfMissing).toHaveBeenCalledWith({ audioVersions: [] })
    expect(chain.append).toHaveBeenCalledWith('audioVersions', [version])
    expect(commit).toHaveBeenCalledWith({ autoGenerateArrayKeys: true })
  })

  it('replaces the matching pending placeholder in place when one is found for this target', async () => {
    const commit = jest.fn().mockResolvedValue(undefined)
    const chain = chainable(commit)
    patch.mockReset().mockReturnValue(chain)
    fetch.mockResolvedValue('key-1')

    await recordAudioVersion('drafts.doc-1', {}, version, 'hash-1')

    expect(chain.set).toHaveBeenCalledWith({
      'audioVersions[_key == "key-1"]': version,
    })
    expect(chain.append).not.toHaveBeenCalled()
  })

  it('falls back to the draft and logs an error when the version no longer exists', async () => {
    const failingChain = chainable(jest.fn().mockRejectedValue(notFoundError()))
    const succeedingChain = chainable(jest.fn().mockResolvedValue(undefined))

    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? failingChain : succeedingChain,
    )

    await recordAudioVersion('versions.r1.doc-1', {}, version, 'hash-1')

    expect(patch).toHaveBeenCalledWith('versions.r1.doc-1')
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(succeedingChain.commit).toHaveBeenCalledWith({
      autoGenerateArrayKeys: true,
    })
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'versions.r1.doc-1',
        draftId: 'drafts.doc-1',
      }),
      expect.stringContaining('falling back to the draft'),
    )
  })

  it('rethrows a non-not-found error without falling back to the draft', async () => {
    const otherError = Object.assign(new Error('boom'), { statusCode: 500 })
    const chain = chainable(jest.fn().mockRejectedValue(otherError))
    patch.mockReset().mockReturnValue(chain)

    await expect(
      recordAudioVersion('versions.r1.doc-1', {}, version, 'hash-1'),
    ).rejects.toThrow('boom')
    expect(loggerError).not.toHaveBeenCalled()
    expect(patch).toHaveBeenCalledTimes(1)
  })

  it('also mirrors the recorded version onto the draft, resolving each target\'s own pending key independently', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )
    // Each document has its own placeholder _key for the same contentHash —
    // the draft's own claim placeholder is not the same object as the
    // version's.
    fetch.mockImplementation((_query: string, params: { id: string }) =>
      Promise.resolve(params.id === 'versions.r1.doc-1' ? 'version-key' : 'draft-key'),
    )

    await recordAudioVersion('versions.r1.doc-1', {}, version, 'hash-1')

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: 'versions.r1.doc-1', hash: 'hash-1' },
      { perspective: 'raw' },
    )
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      { id: 'drafts.doc-1', hash: 'hash-1' },
      { perspective: 'raw' },
    )
    expect(versionChain.set).toHaveBeenCalledWith({
      'audioVersions[_key == "version-key"]': version,
    })
    expect(draftChain.set).toHaveBeenCalledWith({
      'audioVersions[_key == "draft-key"]': version,
    })
    expect(loggerError).not.toHaveBeenCalled()
  })

  it('still resolves successfully when the mirror write to the draft fails', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockRejectedValue(new Error('mirror boom')))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    await expect(
      recordAudioVersion('versions.r1.doc-1', {}, version, 'hash-1'),
    ).resolves.toBeUndefined()
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: 'versions.r1.doc-1',
        draftId: 'drafts.doc-1',
      }),
      expect.stringContaining('failed to mirror'),
    )
  })
})

describe('reportAudioGenerationError', () => {
  beforeEach(() => {
    loggerError.mockReset()
  })

  it('patches the error status directly when the document exists', async () => {
    const chain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockReturnValue(chain)

    await reportAudioGenerationError('drafts.doc-1', new Error('boom'))

    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(patch).toHaveBeenCalledTimes(1)
    expect(chain.set).toHaveBeenCalledWith({
      audioGenerationResult: expect.objectContaining({
        status: 'error',
        error: 'boom',
      }),
    })
  })

  it('falls back to the draft when the version no longer exists', async () => {
    const failingChain = chainable(jest.fn().mockRejectedValue(notFoundError()))
    const succeedingChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? failingChain : succeedingChain,
    )

    await reportAudioGenerationError('versions.r1.doc-1', new Error('boom'))

    expect(succeedingChain.commit).toHaveBeenCalledWith({
      autoGenerateArrayKeys: true,
    })
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ draftId: 'drafts.doc-1' }),
      expect.stringContaining('falling back to the draft'),
    )
  })

  it('also mirrors the error status onto the draft when the primary write succeeds', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    await reportAudioGenerationError('versions.r1.doc-1', new Error('boom'))

    expect(patch).toHaveBeenCalledWith('versions.r1.doc-1')
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    // The generic "audio generation failed" log still fires (unrelated to
    // mirroring), but nothing about the mirror write itself failed.
    expect(loggerError).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('failed to mirror'),
    )
  })

  it('swallows an error from the report write itself (already logged) rather than throwing', async () => {
    const chain = chainable(jest.fn().mockRejectedValue(new Error('network down')))
    patch.mockReset().mockReturnValue(chain)

    await expect(
      reportAudioGenerationError('drafts.doc-1', new Error('boom')),
    ).resolves.toBeUndefined()
    expect(loggerError).toHaveBeenCalledWith(
      { error: expect.any(Error) },
      expect.stringContaining('failed to report audio generation error'),
    )
  })
})

describe('reportAudioGenerationSuccess', () => {
  beforeEach(() => {
    loggerError.mockReset()
  })

  it('patches the success status directly when the document exists', async () => {
    const chain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockReturnValue(chain)

    await reportAudioGenerationSuccess('drafts.doc-1')

    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(patch).toHaveBeenCalledTimes(1)
    expect(chain.set).toHaveBeenCalledWith({
      audioGenerationResult: expect.objectContaining({ status: 'success' }),
    })
  })

  it('falls back to the draft when the version no longer exists', async () => {
    const failingChain = chainable(jest.fn().mockRejectedValue(notFoundError()))
    const succeedingChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? failingChain : succeedingChain,
    )

    await reportAudioGenerationSuccess('versions.r1.doc-1')

    expect(succeedingChain.commit).toHaveBeenCalledWith({
      autoGenerateArrayKeys: true,
    })
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ draftId: 'drafts.doc-1' }),
      expect.stringContaining('falling back to the draft'),
    )
  })

  it('also mirrors the success status onto the draft when the primary write succeeds', async () => {
    const versionChain = chainable(jest.fn().mockResolvedValue(undefined))
    const draftChain = chainable(jest.fn().mockResolvedValue(undefined))
    patch.mockReset().mockImplementation((id: string) =>
      id === 'versions.r1.doc-1' ? versionChain : draftChain,
    )

    await reportAudioGenerationSuccess('versions.r1.doc-1')

    expect(patch).toHaveBeenCalledWith('versions.r1.doc-1')
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(loggerError).not.toHaveBeenCalled()
  })
})
