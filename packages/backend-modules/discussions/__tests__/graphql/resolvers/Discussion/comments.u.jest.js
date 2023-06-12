// jest.mock('../../../../lib/stats/last')

jest.mock('graphql-fields')

const UUT = require('../../../../graphql/resolvers/Discussion/comments')

const now = new Date()

const createCommentPartial = (symbolId, attributes) => {
  return {
    parentIds: null,
    hotness: 0,
    depth: 0,
    createdAt: now,
    featuredAt: null,
    score: 0,
    isPublished: true,
    ...attributes,
    id: Symbol(symbolId),
  }
}

describe('Discussion.comments', () => {
  it('queries only count', async () => {
    expect.assertions(2)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    const expected = {
      id: discussion.id,
      totalCount: Symbol('total count'),
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      __typename: 'CommentConnection',
    }))

    const loadMock = jest.fn(() => expected.totalCount)
    const context = {
      loaders: {
        Discussion: {
          byIdCommentsCount: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(loadMock).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual(expected)
  })

  it('queries only count using tag argument', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
      tags: [Symbol('tag A'), Symbol('tag B')],
    }

    const args = {
      tag: discussion.tags[1],
    }

    const expected = {
      id: discussion.id,
      totalCount: Symbol('count tag B'),
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      __typename: 'CommentConnection',
    }))

    const loadMock = jest.fn(() => [
      {
        discussion: discussion.id,
        value: discussion.tags[0],
        count: Symbol('count tag A'),
      },
      {
        discussion: discussion.id,
        value: discussion.tags[1],
        count: expected.totalCount,
      },
    ])
    const context = {
      loaders: {
        Discussion: {
          byIdCommentTagsCount: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(loadMock).toHaveBeenCalledWith(discussion.id)
    expect(loadMock).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual(expected)
  })

  it('queries only count using unknown tag argument', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
      tags: [Symbol('tag A'), Symbol('tag B')],
    }

    const args = {
      tag: Symbol('random tag'),
    }

    const expected = {
      id: discussion.id,
      totalCount: Symbol('total count'),
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      __typename: 'CommentConnection',
    }))

    const loadMock = jest.fn(() => expected.totalCount)
    const context = {
      loaders: {
        Discussion: {
          byIdCommentsCount: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(loadMock).toHaveBeenCalledWith(discussion.id)
    expect(loadMock).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual(expected)
  })

  it('queries discussion with no comments', async () => {
    expect.assertions(2)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    const expected = {
      id: discussion.id,
      totalCount: 0,
      nodes: [],
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => [])
    const context = {
      pgdb: {
        query: queryMock,
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual(expected)
  })

  it('queries discussion with some root-level comments', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    const commentPartials = [
      createCommentPartial('comment A'),
      createCommentPartial('comment B'),
      createCommentPartial('comment C'),
    ]

    const expected = {
      id: discussion.id,
      nodes: commentPartials.map((comment) => ({
        ...comment,
        comments: {
          id: comment.id,
          nodes: [],
          totalCount: 0,
          directTotalCount: 0,
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      })),
      totalCount: 3,
      directTotalCount: 3,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  it('queries nested comments', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    const commentA = createCommentPartial('comment A')
    const commentA1 = createCommentPartial('comment A1', {
      parentIds: [commentA.id],
    })
    const commentA11 = createCommentPartial('comment A11', {
      parentIds: [commentA.id, commentA1.id],
    })

    const commentPartials = [commentA, commentA1, commentA11]

    const expected = {
      id: discussion.id,
      nodes: [
        {
          ...commentA,
          comments: {
            id: commentA.id,
            nodes: [
              {
                ...commentA1,
                comments: {
                  id: commentA1.id,
                  nodes: [
                    {
                      ...commentA11,
                      comments: {
                        id: commentA11.id,
                        nodes: [],
                        totalCount: 0,
                        directTotalCount: 0,
                        pageInfo: {
                          endCursor: null,
                          hasNextPage: false,
                        },
                      },
                    },
                  ],
                  totalCount: 1,
                  directTotalCount: 1,
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                  },
                },
                topValue: null,
              },
            ],
            totalCount: 2,
            directTotalCount: 1,
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
          topValue: null,
        },
      ],
      totalCount: 3,
      directTotalCount: 1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {}, // comment A
        comments: {
          nodes: {
            id: {}, // comment A1
            comments: {
              nodes: {
                comments: {
                  id: {}, // comment A11
                },
              },
            },
          },
        },
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(2)
    expect(result).toStrictEqual(expected)
  })

  it('queries nested comments flattened', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = { flatDepth: 3 }

    const commentA = createCommentPartial('comment A')
    const commentA1 = createCommentPartial('comment A1', {
      parentIds: [commentA.id],
    })
    const commentA11 = createCommentPartial('comment A11', {
      parentIds: [commentA.id, commentA1.id],
    })

    const commentPartials = [commentA, commentA1, commentA11]

    const expected = {
      id: discussion.id,
      nodes: [commentA, commentA1, commentA11],
      totalCount: 3,
      directTotalCount: 1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  it('queries nested comments, using flatDepth: 2', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = { flatDepth: 2 }

    const commentA = createCommentPartial('comment A')
    const commentA1 = createCommentPartial('comment A1', {
      parentIds: [commentA.id],
    })
    const commentA11 = createCommentPartial('comment A11', {
      parentIds: [commentA.id, commentA1.id],
    })

    const commentPartials = [commentA, commentA1, commentA11]

    const expected = {
      id: discussion.id,
      nodes: [commentA, commentA1],
      totalCount: 3,
      directTotalCount: 1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(3)
    expect(result).toStrictEqual(expected)
  })

  it('queries first comment', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = { first: 1 }

    const commentA = createCommentPartial('comment A')
    const commentA1 = createCommentPartial('comment A1', {
      parentIds: [commentA.id],
    })
    const commentA11 = createCommentPartial('comment A11', {
      parentIds: [commentA.id, commentA1.id],
    })

    const commentPartials = [commentA, commentA1, commentA11]

    const expected = {
      id: discussion.id,
      nodes: [
        {
          ...commentA,
          comments: {
            id: commentA.id,
            nodes: [],
            totalCount: 2,
            directTotalCount: 1,
            pageInfo: {
              endCursor: null,
              hasNextPage: true,
            },
          },
          topValue: null,
        },
      ],
      totalCount: 3,
      directTotalCount: 1,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(2)
    expect(result).toStrictEqual(expected)
  })

  it('orders comments by DATE if first comment younger than 72 hours', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    // now - 72 hours + 1 minute (71 hours, 59 minutes)
    const past = new Date(Date.now() - 1000 * 60 * 60 * 72 + 1)

    const commentPartials = [
      createCommentPartial('comment A'),
      createCommentPartial('comment B'),
      createCommentPartial('comment C', { createdAt: past }),
    ]

    const expected = {
      id: discussion.id,
      nodes: commentPartials.map((comment) => ({
        ...comment,
        comments: {
          id: comment.id,
          nodes: [],
          totalCount: 0,
          directTotalCount: 0,
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      })),
      totalCount: 3,
      directTotalCount: 3,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  it('orders comments by VOTES if first comment old than 72 hours', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const args = {}

    // now - 72 hours - 1 minute
    const past = new Date(Date.now() - 1000 * 60 * 60 * 72 - 1)

    const commentPartials = [
      createCommentPartial('comment A', { createdAt: past }),
      createCommentPartial('comment B'),
      createCommentPartial('comment C'),
    ]

    const expected = {
      id: discussion.id,
      nodes: commentPartials.map((comment) => ({
        ...comment,
        comments: {
          id: comment.id,
          nodes: [],
          totalCount: 0,
          directTotalCount: 0,
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      })),
      totalCount: 3,
      directTotalCount: 3,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'VOTES',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  it('bubbles focused comment to top', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const commentA = createCommentPartial('comment A')
    const commentB = createCommentPartial('comment B')
    const commentC = createCommentPartial('comment C')

    const commentPartials = [commentA, commentB, commentC]

    const args = { focusId: commentC.id }

    commentC.topValue = Number.MAX_SAFE_INTEGER

    const expected = {
      id: discussion.id,
      focus: commentC,
      nodes: [commentC, commentA, commentB].map((comment) => ({
        ...comment,
        comments: {
          id: comment.id,
          nodes: [],
          totalCount: 0,
          directTotalCount: 0,
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      })),
      totalCount: 3,
      directTotalCount: 3,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  it('bubbles thread with focused comment to top', async () => {
    expect.assertions(3)

    const discussion = {
      id: Symbol('discussion ID'),
    }

    const commentA = createCommentPartial('comment A')
    const commentB = createCommentPartial('comment B')
    const commentC = createCommentPartial('comment C')
    const commentC1 = createCommentPartial('comment C1', {
      parentIds: [commentC.id],
    })
    const commentC11 = createCommentPartial('comment C11', {
      parentIds: [commentC.id, commentC1.id],
    })

    const commentPartials = [
      commentA,
      commentB,
      commentC11,
      commentC,
      commentC1,
    ]

    const args = { focusId: commentC11.id }

    commentC.topValue = Number.MAX_SAFE_INTEGER
    commentC1.topValue = Number.MAX_SAFE_INTEGER
    commentC11.topValue = Number.MAX_SAFE_INTEGER

    const expected = {
      id: discussion.id,
      focus: commentC11,
      nodes: [
        {
          ...commentC,
          comments: {
            id: commentC.id,
            nodes: [
              {
                ...commentC1,
                comments: {
                  id: commentC1.id,
                  nodes: [
                    {
                      ...commentC11,
                      comments: {
                        id: commentC11.id,
                        nodes: [],
                        totalCount: 0,
                        directTotalCount: 0,
                        pageInfo: {
                          endCursor: null,
                          hasNextPage: false,
                        },
                      },
                    },
                  ],
                  totalCount: 1,
                  directTotalCount: 1,
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                  },
                },
              },
            ],
            totalCount: 2,
            directTotalCount: 1,
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
        {
          ...commentA,
          comments: {
            id: commentA.id,
            nodes: [],
            totalCount: 0,
            directTotalCount: 0,
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
        {
          ...commentB,
          comments: {
            id: commentB.id,
            nodes: [],
            totalCount: 0,
            directTotalCount: 0,
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      ],
      totalCount: 5,
      directTotalCount: 3,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      resolvedOrderBy: 'DATE',
    }

    require('graphql-fields').mockImplementation(() => ({
      totalCount: {},
      nodes: {
        id: {},
        comments: {
          nodes: {
            id: {},
            comments: {
              nodes: {
                id: {},
              },
            },
          },
        },
      },
      __typename: 'CommentConnection',
    }))

    const queryMock = jest.fn(() => commentPartials)
    const loadMock = jest.fn()

    const context = {
      pgdb: {
        query: queryMock,
      },
      loaders: {
        Comment: {
          byId: {
            load: loadMock,
          },
        },
      },
    }

    const result = await UUT(discussion, args, context)

    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(4)
    expect(result).toStrictEqual(expected)
  })

  // @TDOO: exceptIds (?)
  // @TODO: queries with orderBy: DATE
  // @TODO: queries with orderBy: VOTES
  // @TODO: queries with orderBy: HOT
  // @TODO: queries with orderBy: REPLIES
  // @TODO: queries with orderBy: FEATURED_AT
  // @TODO: queries with parent as anchor, not returning parent
  // @TODO: queries with parent as anchor, including parent
  // @TODO: queries with tag argument
})
