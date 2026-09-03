const patch = jest.fn()

jest.mock('../client', () => ({
  sanityClient: () => ({ patch }),
}))

import { claimAudioGeneration, hasPendingVersion } from '../audio'

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
})
