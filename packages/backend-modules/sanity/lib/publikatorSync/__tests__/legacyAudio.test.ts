const fetchMock = jest.fn()

jest.mock('../../client', () => ({
  sanityClient: () => ({ fetch: fetchMock }),
}))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { linkLegacySyntheticAudio } = require('../legacyAudio')

const baseDoc = { _type: 'article', content: [], slugAuto: true }

function makePgdb({
  link,
  derivative,
}: {
  link?: { derivativeId: string } | null
  derivative?: Record<string, unknown> | null
}) {
  return {
    publikator: {
      commitsWithSynthReadAloud: {
        findOne: jest.fn().mockResolvedValue(link ?? null),
      },
      derivatives: {
        findOne: jest.fn().mockResolvedValue(derivative ?? null),
      },
    },
  }
}

describe('linkLegacySyntheticAudio', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({})
    process.env = { ...OLD_ENV, ASSETS_SERVER_BASE_URL: 'https://assets.example' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('returns the doc unchanged when no commitId is known', async () => {
    const pgdb = makePgdb({})
    const result = await linkLegacySyntheticAudio(baseDoc, undefined, 'doc-1', pgdb)
    expect(result).toEqual({ doc: baseDoc })
  })

  it('returns the doc unchanged when a real generation already exists', async () => {
    fetchMock.mockResolvedValueOnce({ audioContentHash: 'real-content-hash' })
    const pgdb = makePgdb({})
    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(result).toEqual({ doc: baseDoc })
    expect(pgdb.publikator.commitsWithSynthReadAloud.findOne).not.toHaveBeenCalled()
  })

  it('returns the doc unchanged when no derivative is linked to this commit', async () => {
    const pgdb = makePgdb({ link: null })
    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(result).toEqual({ doc: baseDoc })
  })

  it('returns the doc unchanged when the derivative is not Ready or missing result fields', async () => {
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: null, // findOne filtered on status: 'Ready' found nothing
    })
    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(result).toEqual({ doc: baseDoc })
  })

  it('links the legacy assets-server URL and records a new audioVersions entry when a Ready derivative exists', async () => {
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: {
        readyAt: new Date('2026-01-01T00:00:00.000Z'),
        result: {
          audioDuration: 90, // seconds
          s3: { bucket: 'republik-assets', key: 'audio/foo.mp3' },
        },
      },
    })

    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)

    expect(result.doc).toEqual({
      ...baseDoc,
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/foo.mp3',
      audioDurationMs: 90000,
      estimatedConsumptionMinutes: 2,
    })
    expect(result.newVersion).toEqual({
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/foo.mp3',
      durationMs: 90000,
      generatedAt: '2026-01-01T00:00:00.000Z',
    })
    expect(pgdb.publikator.commitsWithSynthReadAloud.findOne).toHaveBeenCalledWith({
      commitId: 'commit-1',
    })
    expect(pgdb.publikator.derivatives.findOne).toHaveBeenCalledWith({
      id: 'deriv-1',
      status: 'Ready',
    })
  })

  it('falls back to now when the derivative has no readyAt', async () => {
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: {
        result: {
          audioDuration: 90,
          s3: { bucket: 'republik-assets', key: 'audio/foo.mp3' },
        },
      },
    })

    const before = Date.now()
    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    const after = Date.now()

    const generatedAtMs = Date.parse(result.newVersion.generatedAt)
    expect(generatedAtMs).toBeGreaterThanOrEqual(before)
    expect(generatedAtMs).toBeLessThanOrEqual(after)
  })

  it('does not record a new version when already linked to the same URL', async () => {
    fetchMock.mockResolvedValueOnce({
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/foo.mp3',
    })
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: {
        result: {
          audioDuration: 90,
          s3: { bucket: 'republik-assets', key: 'audio/foo.mp3' },
        },
      },
    })

    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)

    expect(result.doc).toEqual({
      ...baseDoc,
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/foo.mp3',
      audioDurationMs: 90000,
      estimatedConsumptionMinutes: 2,
    })
    expect(result.newVersion).toBeUndefined()
  })

  it('records a new version when the linked URL changed (a new derivative)', async () => {
    fetchMock.mockResolvedValueOnce({
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/old.mp3',
    })
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-2' },
      derivative: {
        result: {
          audioDuration: 90,
          s3: { bucket: 'republik-assets', key: 'audio/foo.mp3' },
        },
      },
    })

    const result = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)

    expect(result.newVersion).toBeDefined()
    expect(result.newVersion.audioSourceMp3).toBe(
      'https://assets.example/s3/republik-assets/audio/foo.mp3',
    )
  })
})
