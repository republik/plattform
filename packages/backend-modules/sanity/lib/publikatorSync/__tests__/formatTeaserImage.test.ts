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
})
