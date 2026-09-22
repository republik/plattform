// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchFormatFields } = require('../formatFields')

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

describe('fetchFormatFields', () => {
  it('returns undefined when there is no format repoId', async () => {
    const pgdb = makePgdb({})
    expect(await fetchFormatFields(undefined, pgdb)).toBeUndefined()
    expect(pgdb.publikator.milestones.findOne).not.toHaveBeenCalled()
  })

  it('returns undefined when the format has no published milestone', async () => {
    const pgdb = makePgdb({ milestone: null })
    expect(await fetchFormatFields('republik/format-x', pgdb)).toBeUndefined()
    expect(pgdb.publikator.commits.findOne).not.toHaveBeenCalled()
  })

  it('queries the published milestone and its commit', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: {} },
    })

    await fetchFormatFields('republik/format-x', pgdb)

    expect(pgdb.publikator.milestones.findOne).toHaveBeenCalledWith(
      { repoId: 'republik/format-x', scope: 'publication', revokedAt: null },
      { orderBy: { createdAt: 'desc' } },
    )
    expect(pgdb.publikator.commits.findOne).toHaveBeenCalledWith({
      id: 'commit-1',
    })
  })

  it('extracts every field off the format commit meta', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: {
        meta: {
          image: 'https://cdn.repub.ch/s3/bucket/format.jpg',
          kind: 'meta',
          color: '#ff0000',
          section: 'https://github.com/republik/section-politik',
          newsletter: { savedSegmentId: 123 },
          podcast: { some: 'config' },
          shareBackgroundImage: 'https://cdn.repub.ch/s3/bucket/bg.jpg',
          shareLogo: 'https://cdn.repub.ch/s3/bucket/logo.jpg',
        },
      },
    })

    const fields = await fetchFormatFields('republik/format-x', pgdb)

    expect(fields).toEqual({
      image: 'https://cdn.repub.ch/s3/bucket/format.jpg',
      kind: 'meta',
      color: '#ff0000',
      sectionRepoId: 'republik/section-politik',
      hasNewsletter: true,
      hasPodcast: true,
      shareBackgroundImage: 'https://cdn.repub.ch/s3/bucket/bg.jpg',
      shareLogo: 'https://cdn.repub.ch/s3/bucket/logo.jpg',
    })
  })

  it('defaults every field to undefined/false when the format commit has none of them', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: {} },
    })

    const fields = await fetchFormatFields('republik/format-x', pgdb)

    expect(fields).toEqual({
      image: undefined,
      kind: undefined,
      color: undefined,
      sectionRepoId: undefined,
      hasNewsletter: false,
      hasPodcast: false,
      shareBackgroundImage: undefined,
      shareLogo: undefined,
    })
  })

  it('treats null newsletter/podcast as absent (not an object with content)', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: { newsletter: null, podcast: null } },
    })

    const fields = await fetchFormatFields('republik/format-x', pgdb)

    expect(fields.hasNewsletter).toBe(false)
    expect(fields.hasPodcast).toBe(false)
  })

  it('ignores a non-republik meta.section value', async () => {
    const pgdb = makePgdb({
      milestone: { commitId: 'commit-1' },
      commit: { meta: { section: 'https://example.com/not-a-repo' } },
    })

    const fields = await fetchFormatFields('republik/format-x', pgdb)

    expect(fields.sectionRepoId).toBeUndefined()
  })
})
