const fetchArticle = jest.fn()
const reportAudioGenerationSuccess = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationError = jest.fn().mockResolvedValue(undefined)
const hasPendingVersion = jest.fn()
const claimAudioGeneration = jest.fn()
const removePendingVersion = jest.fn().mockResolvedValue(undefined)

jest.mock('../../lib/audio', () => ({
  fetchArticle: (...args: unknown[]) => fetchArticle(...args),
  reportAudioGenerationSuccess: (...args: unknown[]) =>
    reportAudioGenerationSuccess(...args),
  reportAudioGenerationError: (...args: unknown[]) =>
    reportAudioGenerationError(...args),
  errorMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
  hasPendingVersion: (...args: unknown[]) => hasPendingVersion(...args),
  claimAudioGeneration: (...args: unknown[]) => claimAudioGeneration(...args),
  removePendingVersion: (...args: unknown[]) => removePendingVersion(...args),
}))

const uploadToHuebsch = jest.fn()

jest.mock('../../tts', () => ({
  buildSpeakableContent: jest.fn().mockReturnValue([{ type: 'sound' }]),
  plainText: () => '',
  plainTitle: () => 'Title',
  hashSpeakableContent: () => 'content-hash-1',
  buildSignedWebhookPath: () => '/webhooks/sanity/huebsch/doc-1',
  uploadToHuebsch: (...args: unknown[]) => uploadToHuebsch(...args),
  titleSlugFrom: (slug: string | undefined, fallback: string) => slug ?? fallback,
  deriveSlug: () => '/2026/01/01/title',
}))

import { generateAudioHandler } from '../generateAudio'

function mockReqRes(body: Record<string, unknown>) {
  const req: any = { body }
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json: jest.fn(function (this: any, body: unknown) {
      this.body = body
      return this
    }),
  }
  return { req, res }
}

const baseArticle = {
  _id: 'drafts.doc-1',
  _rev: 'rev-1',
  title: [],
  syntheticVoice: 'voice-1',
  syntheticVoiceEnabled: true,
  audioContentHash: undefined,
  audioGenerationResult: undefined,
  pendingAudioVersions: [],
}

describe('generateAudioHandler concurrency guard', () => {
  beforeEach(() => {
    fetchArticle.mockReset()
    reportAudioGenerationSuccess.mockReset().mockResolvedValue(undefined)
    reportAudioGenerationError.mockReset().mockResolvedValue(undefined)
    hasPendingVersion.mockReset().mockReturnValue(false)
    claimAudioGeneration.mockReset().mockResolvedValue(true)
    removePendingVersion.mockReset().mockResolvedValue(undefined)
    uploadToHuebsch.mockReset().mockResolvedValue(undefined)
    process.env.PUBLIC_URL = 'https://api.example.com'
  })

  it('proceeds to Huebsch when nothing else is in progress and the claim succeeds', async () => {
    fetchArticle.mockResolvedValue(baseArticle)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(claimAudioGeneration).toHaveBeenCalledWith(
      'drafts.doc-1',
      'rev-1',
      'content-hash-1',
    )
    expect(uploadToHuebsch).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('bails out without calling Huebsch when a pending version already exists for this exact content hash', async () => {
    fetchArticle.mockResolvedValue(baseArticle)
    hasPendingVersion.mockReturnValue(true)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(hasPendingVersion).toHaveBeenCalledWith(
      baseArticle.pendingAudioVersions,
      'content-hash-1',
    )
    expect(claimAudioGeneration).not.toHaveBeenCalled()
    expect(uploadToHuebsch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, alreadyInProgress: true })
  })

  it('proceeds to Huebsch when a pending version exists for a different content hash', async () => {
    // The core fix: an editor changing the article again while an earlier,
    // different-hash generation is still in flight must be able to start a
    // second, independent one rather than being blocked by it.
    fetchArticle.mockResolvedValue({
      ...baseArticle,
      pendingAudioVersions: [
        { contentHash: 'some-other-hash', generatedAt: new Date().toISOString() },
      ],
    })
    hasPendingVersion.mockReturnValue(false)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(claimAudioGeneration).toHaveBeenCalledWith(
      'drafts.doc-1',
      'rev-1',
      'content-hash-1',
    )
    expect(uploadToHuebsch).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('bails out without calling Huebsch when a sibling request wins the claim first', async () => {
    // This is the actual failure mode this guard exists for: a burst of
    // rapid saves each spawning their own sync-audio invocation, each
    // reading a different, newer revision, so hasPendingVersion (checked
    // against a slightly stale read) doesn't catch it — only the
    // revision-guarded claim itself does.
    fetchArticle.mockResolvedValue(baseArticle)
    claimAudioGeneration.mockResolvedValue(false)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(uploadToHuebsch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, alreadyInProgress: true })
  })

  it('cleans up the claimed placeholder when the Huebsch request itself fails', async () => {
    fetchArticle.mockResolvedValue(baseArticle)
    const failure = new Error('huebsch unreachable')
    uploadToHuebsch.mockRejectedValue(failure)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)
    // uploadToHuebsch is fire-and-forget (not awaited by the handler) — flush
    // the microtask queue so its .catch() has a chance to run.
    await new Promise((resolve) => setImmediate(resolve))

    expect(removePendingVersion).toHaveBeenCalledWith('drafts.doc-1', 'content-hash-1')
    expect(reportAudioGenerationError).toHaveBeenCalledWith('drafts.doc-1', failure)
  })
})
