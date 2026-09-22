const createOrReplace = jest.fn()

jest.mock('../../client', () => ({
  sanityClient: () => ({ createOrReplace }),
}))

import {
  discussionIdForArticle,
  linkLegacyDiscussion,
  LegacyDiscussionRow,
  toSanityDiscussionFields,
} from '../discussionRef'

describe('discussionIdForArticle', () => {
  it('is deterministic', () => {
    expect(discussionIdForArticle('article-1')).toBe(
      discussionIdForArticle('article-1'),
    )
  })

  it('produces a valid v5 UUID', () => {
    expect(discussionIdForArticle('article-1')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it("matches studio's functions/create-discussion/buildDiscussionDoc.ts derivation exactly", () => {
    // Regression pin against a namespace-string typo silently diverging from
    // Studio's own algorithm -- computed once via the same formula
    // (uuidV5('ch.republik.studio.discussion', uuidV5.DNS), then
    // uuidV5(articleId, that namespace)) and hardcoded here.
    expect(discussionIdForArticle('article-1')).toBe(
      '5684353d-991c-5203-895d-2100190a8dde',
    )
  })
})

describe('toSanityDiscussionFields', () => {
  it('maps every Postgres column to its Sanity field name', () => {
    const row: LegacyDiscussionRow = {
      id: 'pg-id-1',
      title: 'Hello',
      path: '/2026/01/01/hello',
      closed: true,
      hidden: false,
      allowedRoles: ['member'],
      maxLength: 500,
      disableTopLevelComments: false,
      collapsable: true,
      defaultOrder: 'DATE',
      anonymity: 'ALLOWED',
      tags: ['tag1'],
      tagRequired: false,
    }

    expect(toSanityDiscussionFields(row)).toEqual({
      title: 'Hello',
      path: '/2026/01/01/hello',
      discussionClosed: true,
      discussionHidden: false,
      allowedRoles: ['member'],
      commentsMaxLength: 500,
      disableTopLevelComments: false,
      commentsCollapsable: true,
      commentsDefaultOrder: 'DATE',
      discussionAnonymity: 'ALLOWED',
      tags: ['tag1'],
      tagRequired: false,
      backendDiscussionId: 'pg-id-1',
    })
  })

  it('passes null columns through as explicit null (Postgres is authoritative)', () => {
    const row: LegacyDiscussionRow = {
      id: 'pg-id-1',
      title: null,
      path: null,
      closed: null,
      hidden: null,
      allowedRoles: null,
      maxLength: null,
      disableTopLevelComments: null,
      collapsable: null,
      defaultOrder: null,
      anonymity: null,
      tags: null,
      tagRequired: null,
    }

    expect(toSanityDiscussionFields(row)).toEqual({
      title: null,
      path: null,
      discussionClosed: null,
      discussionHidden: null,
      allowedRoles: null,
      commentsMaxLength: null,
      disableTopLevelComments: null,
      commentsCollapsable: null,
      commentsDefaultOrder: null,
      discussionAnonymity: null,
      tags: null,
      tagRequired: null,
      backendDiscussionId: 'pg-id-1',
    })
  })
})

describe('linkLegacyDiscussion', () => {
  beforeEach(() => {
    createOrReplace.mockReset()
  })

  it('returns undefined and never writes to Sanity when no legacy discussion exists', async () => {
    const findOne = jest.fn().mockResolvedValue(undefined)
    const pgdb = { public: { discussions: { findOne } } } as never

    const result = await linkLegacyDiscussion(pgdb, 'republik/foo', 'article-1')

    expect(result).toBeUndefined()
    expect(findOne).toHaveBeenCalledWith({ repoId: 'republik/foo' })
    expect(createOrReplace).not.toHaveBeenCalled()
  })

  it('writes the Sanity discussion doc and returns a reference when a legacy discussion exists', async () => {
    const row: LegacyDiscussionRow = {
      id: 'pg-id-1',
      title: 'Hello',
      path: '/2026/01/01/hello',
      closed: false,
      hidden: false,
      allowedRoles: ['member'],
      maxLength: null,
      disableTopLevelComments: false,
      collapsable: true,
      defaultOrder: null,
      anonymity: 'ALLOWED',
      tags: [],
      tagRequired: false,
    }
    const findOne = jest.fn().mockResolvedValue(row)
    const pgdb = { public: { discussions: { findOne } } } as never

    const result = await linkLegacyDiscussion(pgdb, 'republik/foo', 'article-1')

    const expectedId = discussionIdForArticle('article-1')
    expect(createOrReplace).toHaveBeenCalledWith({
      _id: expectedId,
      _type: 'discussion',
      ...toSanityDiscussionFields(row),
    })
    expect(result).toEqual({ _type: 'reference', _ref: expectedId })
  })

  it('propagates a Sanity write failure', async () => {
    const findOne = jest.fn().mockResolvedValue({
      id: 'pg-id-1',
    } as LegacyDiscussionRow)
    const pgdb = { public: { discussions: { findOne } } } as never
    createOrReplace.mockRejectedValueOnce(new Error('sanity down'))

    await expect(
      linkLegacyDiscussion(pgdb, 'republik/foo', 'article-1'),
    ).rejects.toThrow('sanity down')
  })
})
