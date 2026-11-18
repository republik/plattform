const fetchAudioLinkState = jest.fn()
const markPendingVersionError = jest.fn().mockResolvedValue(undefined)
const recordAudioVersion = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationSuccess = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationError = jest.fn().mockResolvedValue(undefined)
const uploadAudioAsset = jest.fn()

jest.mock('../../lib/audio', () => ({
  fetchAudioLinkState: (...args: unknown[]) => fetchAudioLinkState(...args),
  markPendingVersionError: (...args: unknown[]) => markPendingVersionError(...args),
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
    fetchAudioLinkState.mockReset()
    markPendingVersionError.mockReset().mockResolvedValue(undefined)
    recordAudioVersion.mockReset().mockResolvedValue(undefined)
    reportAudioGenerationSuccess.mockReset().mockResolvedValue(undefined)
    reportAudioGenerationError.mockReset().mockResolvedValue(undefined)
    uploadAudioAsset.mockReset()
    parseHuebschResult.mockReset()
  })

  // sha1 of Buffer.from([1, 2, 3])
  const SHA1 = '7037807198c22a7d2b0807371d763779a84fdfcf'

  it('skips a duplicate delivery when this contentHash and audio file are already recorded', async () => {
    fetchAudioLinkState.mockResolvedValue({
      audioContentHash: 'hash-abc',
      audioSourceMp3: `https://cdn.sanity.io/files/p/d/${SHA1}.mp3`,
    })
    parseHuebschResult.mockResolvedValue({ audioFile: new Uint8Array([1, 2, 3]) })

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-abc', {})

    expect(uploadAudioAsset).not.toHaveBeenCalled()
    expect(recordAudioVersion).not.toHaveBeenCalled()
    expect(reportAudioGenerationSuccess).not.toHaveBeenCalled()
  })

  it('records a re-rendered audio file even when the contentHash is unchanged', async () => {
    fetchAudioLinkState.mockResolvedValue({
      audioContentHash: 'hash-abc',
      audioSourceMp3: 'https://cdn.sanity.io/files/p/d/0000000000000000000000000000000000000000.mp3',
    })
    parseHuebschResult.mockResolvedValue({
      audioFile: new Uint8Array([1, 2, 3]),
      chapters: undefined,
      durationMs: 12000,
    })
    uploadAudioAsset.mockResolvedValue({ _id: 'file-asset-1', url: 'https://x/a.mp3' })

    await processResult(fakeReq(), 'doc-1', 'my-slug', 'hash-abc', {})

    expect(recordAudioVersion).toHaveBeenCalledTimes(1)
    expect(reportAudioGenerationSuccess).toHaveBeenCalledWith('doc-1')
  })

  it('skips an unreadable payload when this contentHash is already recorded', async () => {
    fetchAudioLinkState.mockResolvedValue({
      audioContentHash: 'hash-abc',
      audioSourceMp3: 'https://x/a.mp3',
    })
    parseHuebschResult.mockRejectedValue(new Error('failed generation'))

    await processResult(fakeReq(), 'doc-1', 'my-slug', 'hash-abc', { ok: false })

    expect(recordAudioVersion).not.toHaveBeenCalled()
    expect(markPendingVersionError).not.toHaveBeenCalled()
    expect(reportAudioGenerationError).not.toHaveBeenCalled()
  })

  it('processes a genuinely new result when the hash differs (or is absent)', async () => {
    fetchAudioLinkState.mockResolvedValue(undefined)
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

  it('passes the contentHash through so recordAudioVersion can resolve its own pending placeholder', async () => {
    fetchAudioLinkState.mockResolvedValue(undefined)
    parseHuebschResult.mockResolvedValue({
      audioFile: new Uint8Array([1, 2, 3]),
      chapters: undefined,
      durationMs: 12000,
    })
    uploadAudioAsset.mockResolvedValue({ _id: 'file-asset-1', url: 'https://x/a.mp3' })

    await processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-new', {})

    const [, , , contentHash] = recordAudioVersion.mock.calls[0]
    expect(contentHash).toBe('hash-new')
  })

  it('marks the matching placeholder as errored when Huebsch reports a failed generation, without rethrowing', async () => {
    fetchAudioLinkState.mockResolvedValue(undefined)
    const failure = new Error('huebsch reported a failed generation')
    parseHuebschResult.mockRejectedValue(failure)

    await expect(
      processResult(fakeReq(), 'drafts.doc-1', 'my-slug', 'hash-new', { ok: false }),
    ).resolves.toBeUndefined()

    expect(recordAudioVersion).not.toHaveBeenCalled()
    expect(reportAudioGenerationSuccess).not.toHaveBeenCalled()
    expect(markPendingVersionError).toHaveBeenCalledWith(
      'drafts.doc-1',
      'hash-new',
      failure,
    )
    expect(reportAudioGenerationError).toHaveBeenCalledWith('drafts.doc-1', failure)
  })
})
