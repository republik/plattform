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
    fetchMock.mockReset()
    process.env = { ...OLD_ENV, ASSETS_SERVER_BASE_URL: 'https://assets.example' }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('returns the doc unchanged when no commitId is known', async () => {
    const pgdb = makePgdb({})
    const doc = await linkLegacySyntheticAudio(baseDoc, undefined, 'doc-1', pgdb)
    expect(doc).toBe(baseDoc)
  })

  it('returns the doc unchanged when a real generation already exists', async () => {
    fetchMock.mockResolvedValueOnce('real-content-hash')
    const pgdb = makePgdb({})
    const doc = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(doc).toBe(baseDoc)
    expect(pgdb.publikator.commitsWithSynthReadAloud.findOne).not.toHaveBeenCalled()
  })

  it('returns the doc unchanged when no derivative is linked to this commit', async () => {
    fetchMock.mockResolvedValueOnce(undefined)
    const pgdb = makePgdb({ link: null })
    const doc = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(doc).toBe(baseDoc)
  })

  it('returns the doc unchanged when the derivative is not Ready or missing result fields', async () => {
    fetchMock.mockResolvedValueOnce(undefined)
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: null, // findOne filtered on status: 'Ready' found nothing
    })
    const doc = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)
    expect(doc).toBe(baseDoc)
  })

  it('links the legacy assets-server URL when a Ready derivative exists', async () => {
    fetchMock.mockResolvedValueOnce(undefined)
    const pgdb = makePgdb({
      link: { derivativeId: 'deriv-1' },
      derivative: {
        result: {
          audioDuration: 90, // seconds
          s3: { bucket: 'republik-assets', key: 'audio/foo.mp3' },
        },
      },
    })

    const doc = await linkLegacySyntheticAudio(baseDoc, 'commit-1', 'doc-1', pgdb)

    expect(doc).toEqual({
      ...baseDoc,
      audioSourceMp3: 'https://assets.example/s3/republik-assets/audio/foo.mp3',
      audioDurationMs: 90000,
      estimatedConsumptionMinutes: 2,
    })
    expect(pgdb.publikator.commitsWithSynthReadAloud.findOne).toHaveBeenCalledWith({
      commitId: 'commit-1',
    })
    expect(pgdb.publikator.derivatives.findOne).toHaveBeenCalledWith({
      id: 'deriv-1',
      status: 'Ready',
    })
  })
})
