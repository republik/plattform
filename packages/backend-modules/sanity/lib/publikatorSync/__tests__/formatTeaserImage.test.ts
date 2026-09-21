// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolveFormatTeaserImage } = require('../formatTeaserImage')

const baseDoc = { _type: 'article', content: [], slugAuto: true }

function makePgdb({
  milestone,
  commit,
}: {
  milestone?: { commitId: string } | null
  commit?: Record<string, unknown> | null
}) {
  return {
    publikator: {
      milestones: {
        findOne: jest.fn().mockResolvedValue(milestone ?? null),
      },
      commits: {
        findOne: jest.fn().mockResolvedValue(commit ?? null),
      },
    },
  }
}

describe('resolveFormatTeaserImage', () => {
  it('returns the doc unchanged when it already has a teaserSmall.image', async () => {
    const doc = { ...baseDoc, teaserSmall: { _type: 'teaserSmallConfig', image: {} } }
    const pgdb = makePgdb({})

    const result = await resolveFormatTeaserImage(doc, 'republik/format-x', pgdb)

    expect(result).toBe(doc)
    expect(pgdb.publikator.milestones.findOne).not.toHaveBeenCalled()
  })

  it('returns the doc unchanged when there is no format repoId', async () => {
    const pgdb = makePgdb({})
    const result = await resolveFormatTeaserImage(baseDoc, undefined, pgdb)
    expect(result).toBe(baseDoc)
    expect(pgdb.publikator.milestones.findOne).not.toHaveBeenCalled()
  })

  it('returns the doc unchanged when the format has no published milestone', async () => {
    const pgdb = makePgdb({ milestone: null })
    const result = await resolveFormatTeaserImage(baseDoc, 'republik/format-x', pgdb)
    expect(result).toBe(baseDoc)
    expect(pgdb.publikator.commits.findOne).not.toHaveBeenCalled()
  })

  it('returns the doc unchanged when the published commit has no meta.image', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: {} },
    })
    const result = await resolveFormatTeaserImage(baseDoc, 'republik/format-x', pgdb)
    expect(result).toBe(baseDoc)
  })

  it("sets teaserSmall.image from the format's published commit image", async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: { image: 'https://cdn.repub.ch/s3/bucket/format.jpg' } },
    })

    const result = await resolveFormatTeaserImage(baseDoc, 'republik/format-x', pgdb)

    expect(result.teaserSmall).toEqual({
      _type: 'teaserSmallConfig',
      image: {
        _type: 'image',
        _sanityAsset:
          'image@https://bucket.s3.eu-central-1.amazonaws.com/format.jpg',
      },
    })
    expect(pgdb.publikator.milestones.findOne).toHaveBeenCalledWith(
      { repoId: 'republik/format-x', scope: 'publication', revokedAt: null },
      { orderBy: { createdAt: 'desc' } },
    )
    expect(pgdb.publikator.commits.findOne).toHaveBeenCalledWith({
      id: 'commit-1',
    })
  })

  // The format's own commit row is raw, unrendered Postgres data too — same
  // relative-path case as an article's own meta.image/cover.
  it("resolves a relative 'images/...' path on the format's own commit via formatRepoId", async () => {
    const OLD_ENV = process.env
    process.env = {
      ...OLD_ENV,
      ASSETS_SERVER_BASE_URL: 'https://cdn.repub.ch',
      AWS_S3_BUCKET: 'republik-assets',
    }
    try {
      const pgdb = makePgdb({
        milestone: { commitId: 'commit-1' },
        commit: { meta: { image: 'images/format-hash.jpg?size=1x1' } },
      })

      const result = await resolveFormatTeaserImage(
        baseDoc,
        'republik/format-x',
        pgdb,
      )

      expect((result.teaserSmall?.image as any)._sanityAsset).toBe(
        'image@https://republik-assets.s3.eu-central-1.amazonaws.com/repos/republik/format-x/images/format-hash.jpg',
      )
    } finally {
      process.env = OLD_ENV
    }
  })
})
