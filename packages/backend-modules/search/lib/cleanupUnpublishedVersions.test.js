const {
  getOlderThanDate,
  buildUnpublishedVersionsQuery,
  indexMilestonesByName,
  getMilestoneAge,
  selectStaleVersions,
  toBulkDeleteBody,
} = require('./cleanupUnpublishedVersions')

describe('getOlderThanDate', () => {
  it('subtracts the given number of weeks from now', () => {
    const now = new Date('2026-08-10T00:00:00.000Z')

    expect(getOlderThanDate(3, now)).toEqual(
      new Date('2026-07-20T00:00:00.000Z'),
    )
  })

  it('defaults to the current time when now is omitted', () => {
    const before = Date.now()
    const result = getOlderThanDate(0)
    const after = Date.now()

    expect(result.getTime()).toBeGreaterThanOrEqual(before)
    expect(result.getTime()).toBeLessThanOrEqual(after)
  })
})

describe('buildUnpublishedVersionsQuery', () => {
  it('matches only fully-unpublished versions of the repoId, without any date filter', () => {
    expect(
      buildUnpublishedVersionsQuery({ repoId: 'republik/magazine' }),
    ).toEqual({
      bool: {
        must: [
          { term: { __type: 'Document' } },
          { term: { 'meta.repoId': 'republik/magazine' } },
          { term: { '__state.published': false } },
          { term: { '__state.prepublished': false } },
        ],
      },
    })
  })
})

describe('getMilestoneAge', () => {
  it('prefers revokedAt over createdAt', () => {
    expect(
      getMilestoneAge({
        createdAt: '2020-01-01T00:00:00.000Z',
        revokedAt: '2022-01-01T00:00:00.000Z',
      }),
    ).toEqual(new Date('2022-01-01T00:00:00.000Z'))
  })

  it('falls back to createdAt when revokedAt is missing', () => {
    expect(
      getMilestoneAge({ createdAt: '2020-01-01T00:00:00.000Z' }),
    ).toEqual(new Date('2020-01-01T00:00:00.000Z'))
  })

  it('returns null for a missing milestone', () => {
    expect(getMilestoneAge(null)).toBe(null)
    expect(getMilestoneAge(undefined)).toBe(null)
  })
})

describe('indexMilestonesByName', () => {
  it('indexes milestones by name', () => {
    const m1 = { name: 'v1', createdAt: '2020-01-01T00:00:00.000Z' }
    const m2 = { name: 'v2', createdAt: '2021-01-01T00:00:00.000Z' }

    expect(indexMilestonesByName([m1, m2])).toEqual({ v1: m1, v2: m2 })
  })

  it('keeps the more recently-aged milestone when names collide', () => {
    const older = { name: 'v1', createdAt: '2020-01-01T00:00:00.000Z' }
    const newer = { name: 'v1', createdAt: '2021-01-01T00:00:00.000Z' }

    expect(indexMilestonesByName([older, newer])).toEqual({ v1: newer })
    expect(indexMilestonesByName([newer, older])).toEqual({ v1: newer })
  })
})

describe('selectStaleVersions', () => {
  const hit = (versionName, id = versionName) => ({
    _id: id,
    _source: { versionName },
  })

  it('marks a version stale when its milestone age is older than the threshold', () => {
    const hits = [hit('v1')]
    const milestonesByName = {
      v1: { revokedAt: '2020-01-01T00:00:00.000Z' },
    }

    const { stale, kept } = selectStaleVersions({
      hits,
      milestonesByName,
      olderThan: new Date('2021-01-01T00:00:00.000Z'),
    })

    expect(stale).toEqual([
      { hit: hits[0], age: new Date('2020-01-01T00:00:00.000Z') },
    ])
    expect(kept).toEqual([])
  })

  it('keeps a version whose milestone age is not older than the threshold', () => {
    const hits = [hit('v1')]
    const milestonesByName = {
      v1: { revokedAt: '2022-01-01T00:00:00.000Z' },
    }

    const { stale, kept } = selectStaleVersions({
      hits,
      milestonesByName,
      olderThan: new Date('2021-01-01T00:00:00.000Z'),
    })

    expect(stale).toEqual([])
    expect(kept).toEqual([
      {
        hit: hits[0],
        reason: 'not older than threshold',
        age: new Date('2022-01-01T00:00:00.000Z'),
      },
    ])
  })

  it('keeps (does not delete) a version with no matching milestone', () => {
    const hits = [hit('v1')]

    const { stale, kept } = selectStaleVersions({
      hits,
      milestonesByName: {},
      olderThan: new Date('2021-01-01T00:00:00.000Z'),
    })

    expect(stale).toEqual([])
    expect(kept).toEqual([
      { hit: hits[0], reason: 'no milestone found for versionName' },
    ])
  })

  it('partitions a mix of stale, kept, and unknown versions', () => {
    const hits = [hit('stale'), hit('recent'), hit('unknown')]
    const milestonesByName = {
      stale: { revokedAt: '2020-01-01T00:00:00.000Z' },
      recent: { revokedAt: '2022-06-01T00:00:00.000Z' },
    }

    const { stale, kept } = selectStaleVersions({
      hits,
      milestonesByName,
      olderThan: new Date('2021-01-01T00:00:00.000Z'),
    })

    expect(stale.map(({ hit }) => hit._id)).toEqual(['stale'])
    expect(kept.map(({ hit }) => hit._id)).toEqual(['recent', 'unknown'])
  })
})

describe('toBulkDeleteBody', () => {
  it('maps each id to a delete op against the given index, preserving order', () => {
    expect(
      toBulkDeleteBody('republik-document-write', ['id-1', 'id-2']),
    ).toEqual([
      { delete: { _index: 'republik-document-write', _id: 'id-1' } },
      { delete: { _index: 'republik-document-write', _id: 'id-2' } },
    ])
  })

  it('returns an empty array for no ids', () => {
    expect(toBulkDeleteBody('republik-document-write', [])).toEqual([])
  })
})
