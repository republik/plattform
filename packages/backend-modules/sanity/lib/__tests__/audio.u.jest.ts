const patch = jest.fn()

jest.mock('../client', () => ({
  sanityClient: () => ({ patch }),
}))

import { claimAudioGeneration, isAudioGenerationInProgress } from '../audio'

describe('isAudioGenerationInProgress', () => {
  it('is false when there is no result yet', () => {
    expect(isAudioGenerationInProgress(undefined)).toBe(false)
  })

  it('is false for a success/error status', () => {
    expect(isAudioGenerationInProgress({ status: 'success' })).toBe(false)
    expect(isAudioGenerationInProgress({ status: 'error' })).toBe(false)
  })

  it('is true for a fresh in-progress claim', () => {
    expect(
      isAudioGenerationInProgress({
        status: 'in-progress',
        updatedAt: new Date().toISOString(),
      }),
    ).toBe(true)
  })

  it('is false for an in-progress claim older than 72h (abandoned run)', () => {
    const seventyThreeHoursAgo = new Date(
      Date.now() - 73 * 60 * 60 * 1000,
    ).toISOString()
    expect(
      isAudioGenerationInProgress({
        status: 'in-progress',
        updatedAt: seventyThreeHoursAgo,
      }),
    ).toBe(false)
  })

  it('treats an in-progress claim with no updatedAt as not stale (never expires)', () => {
    expect(isAudioGenerationInProgress({ status: 'in-progress' })).toBe(true)
  })
})

describe('claimAudioGeneration', () => {
  const ifRevisionId = jest.fn()
  const set = jest.fn()
  const commit = jest.fn()

  beforeEach(() => {
    patch.mockReset().mockReturnValue({ ifRevisionId })
    ifRevisionId.mockReset().mockReturnValue({ set })
    set.mockReset().mockReturnValue({ commit })
    commit.mockReset()
  })

  it('returns true when the revision-guarded patch commits', async () => {
    commit.mockResolvedValue(undefined)

    const claimed = await claimAudioGeneration('drafts.doc-1', 'rev-1')

    expect(claimed).toBe(true)
    expect(patch).toHaveBeenCalledWith('drafts.doc-1')
    expect(ifRevisionId).toHaveBeenCalledWith('rev-1')
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

    const claimed = await claimAudioGeneration('drafts.doc-1', 'rev-1')

    expect(claimed).toBe(false)
  })

  it('rethrows any other error', async () => {
    commit.mockRejectedValue(new Error('network error'))

    await expect(claimAudioGeneration('drafts.doc-1', 'rev-1')).rejects.toThrow(
      'network error',
    )
  })
})
