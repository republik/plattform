const fetchAudioContentHash = jest.fn()
const fetchPendingVersionKey = jest.fn()
const recordAudioVersion = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationSuccess = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationError = jest.fn().mockResolvedValue(undefined)
const uploadAudioAsset = jest.fn()

jest.mock('../../lib/audio', () => ({
  fetchAudioContentHash: (...args: unknown[]) => fetchAudioContentHash(...args),
  fetchPendingVersionKey: (...args: unknown[]) => fetchPendingVersionKey(...args),
  recordAudioVersion: (...args: unknown[]) => recordAudioVersion(...args),
  reportAudioGenerationSuccess: (...args: unknown[]) =>
    reportAudioGenerationSuccess(...args),
  reportAudioGenerationError: (...args: unknown[]) =>
    reportAudioGenerationError(...args),
  uploadAudioAsset: (...args: unknown[]) => uploadAudioAsset(...args),
}))

const parseHuebschResult = jest.fn()
const mirrorToS3 = jest.fn().mockResolvedValue(undefined)

jest.mock('../../tts', () => ({
  compactTimestamp: () => '20260101-000000',
  titleSlugFrom: (slug: string | undefined, fallback: string) => slug ?? fallback,
  parseHuebschResult: (...args: unknown[]) => parseHuebschResult(...args),
  verifyWebhookSignature: () => true,
  mirrorToS3: (...args: unknown[]) => mirrorToS3(...args),
}))

import { processResult } from '../huebschWebhook'

function fakeReq() {
  return { log: { info: jest.fn(), error: jest.fn() } } as any
}

describe('processResult (huebsch webhook idempotency)', () => {
  beforeEach(() => {
    fetchAudioContentHash.mockReset()
    fetchPendingVersionKey.mockReset().mockResolvedValue(undefined)
    recordAudioVersion.mockReset().mockResolvedValue(undefined)
    reportAudioGenerationSuccess.mockReset().mockResolvedValue(undefined)
    uploadAudioAsset.mockReset()
    parseHuebschResult.mockReset()
  })

  it('skips a duplicate delivery when this contentHash is already recorded', async () => {
    fetchAudioContentHash.mockResolvedValue('hash-abc')

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-abc', {})

    expect(parseHuebschResult).not.toHaveBeenCalled()
    expect(uploadAudioAsset).not.toHaveBeenCalled()
    expect(recordAudioVersion).not.toHaveBeenCalled()
    expect(reportAudioGenerationSuccess).not.toHaveBeenCalled()
  })

  it('processes a genuinely new result when the hash differs (or is absent)', async () => {
    fetchAudioContentHash.mockResolvedValue(undefined)
    parseHuebschResult.mockResolvedValue({
      audioFile: new Uint8Array([1, 2, 3]),
      chapters: undefined,
      durationMs: 12000,
    })
    uploadAudioAsset.mockResolvedValue({ _id: 'file-asset-1', url: 'https://x/a.mp3' })

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-new', {})

    expect(recordAudioVersion).toHaveBeenCalledTimes(1)
    const [documentId, currentFields] = recordAudioVersion.mock.calls[0]
    expect(documentId).toBe('drafts.doc-1')
    expect(currentFields.audioContentHash).toBe('hash-new')
    expect(reportAudioGenerationSuccess).toHaveBeenCalledWith('drafts.doc-1')
  })

  it('replaces the matching pending placeholder in place when one exists', async () => {
    fetchAudioContentHash.mockResolvedValue(undefined)
    fetchPendingVersionKey.mockResolvedValue('pending-key-1')
    parseHuebschResult.mockResolvedValue({
      audioFile: new Uint8Array([1, 2, 3]),
      chapters: undefined,
      durationMs: 12000,
    })
    uploadAudioAsset.mockResolvedValue({ _id: 'file-asset-1', url: 'https://x/a.mp3' })

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-new', {})

    expect(fetchPendingVersionKey).toHaveBeenCalledWith('drafts.doc-1', 'hash-new')
    const [, , , pendingKey] = recordAudioVersion.mock.calls[0]
    expect(pendingKey).toBe('pending-key-1')
  })

  it('falls back to appending when no matching pending placeholder exists', async () => {
    fetchAudioContentHash.mockResolvedValue(undefined)
    fetchPendingVersionKey.mockResolvedValue(undefined)
    parseHuebschResult.mockResolvedValue({
      audioFile: new Uint8Array([1, 2, 3]),
      chapters: undefined,
      durationMs: 12000,
    })
    uploadAudioAsset.mockResolvedValue({ _id: 'file-asset-1', url: 'https://x/a.mp3' })

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-new', {})

    const [, , , pendingKey] = recordAudioVersion.mock.calls[0]
    expect(pendingKey).toBeUndefined()
  })
})
