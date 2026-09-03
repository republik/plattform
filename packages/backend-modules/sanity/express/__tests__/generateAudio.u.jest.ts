const fetchArticle = jest.fn()
const reportAudioGenerationSuccess = jest.fn().mockResolvedValue(undefined)
const reportAudioGenerationError = jest.fn().mockResolvedValue(undefined)
const isAudioGenerationInProgress = jest.fn()
const claimAudioGeneration = jest.fn()

jest.mock('../../lib/audio', () => ({
  fetchArticle: (...args: unknown[]) => fetchArticle(...args),
  reportAudioGenerationSuccess: (...args: unknown[]) =>
    reportAudioGenerationSuccess(...args),
  reportAudioGenerationError: (...args: unknown[]) =>
    reportAudioGenerationError(...args),
  errorMessage: (e: unknown) => (e instanceof Error ? e.message : String(e)),
  isAudioGenerationInProgress: (...args: unknown[]) =>
    isAudioGenerationInProgress(...args),
  claimAudioGeneration: (...args: unknown[]) => claimAudioGeneration(...args),
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
}

describe('generateAudioHandler concurrency guard', () => {
  beforeEach(() => {
    fetchArticle.mockReset()
    reportAudioGenerationSuccess.mockReset().mockResolvedValue(undefined)
    reportAudioGenerationError.mockReset().mockResolvedValue(undefined)
    isAudioGenerationInProgress.mockReset().mockReturnValue(false)
    claimAudioGeneration.mockReset().mockResolvedValue(true)
    uploadToHuebsch.mockReset().mockResolvedValue(undefined)
    process.env.PUBLIC_URL = 'https://api.example.com'
  })

  it('proceeds to Huebsch when nothing else is in progress and the claim succeeds', async () => {
    fetchArticle.mockResolvedValue(baseArticle)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(claimAudioGeneration).toHaveBeenCalledWith('drafts.doc-1', 'rev-1')
    expect(uploadToHuebsch).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ success: true })
  })

  it('bails out without calling Huebsch when the article already shows an in-progress generation', async () => {
    fetchArticle.mockResolvedValue(baseArticle)
    isAudioGenerationInProgress.mockReturnValue(true)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(claimAudioGeneration).not.toHaveBeenCalled()
    expect(uploadToHuebsch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, alreadyInProgress: true })
  })

  it('bails out without calling Huebsch when a sibling request wins the claim first', async () => {
    // This is the actual failure mode this guard exists for: a burst of
    // rapid saves each spawning their own sync-audio invocation, each
    // reading a different, newer revision, so isAudioGenerationInProgress
    // (checked against a slightly stale read) doesn't catch it — only the
    // revision-guarded claim itself does.
    fetchArticle.mockResolvedValue(baseArticle)
    claimAudioGeneration.mockResolvedValue(false)
    const { req, res } = mockReqRes({ documentId: 'drafts.doc-1' })

    await generateAudioHandler(req, res)

    expect(uploadToHuebsch).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({ success: true, alreadyInProgress: true })
  })
})
