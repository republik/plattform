const {
  assembleTree,
  measureTree,
  deepSortTree,
  filterTree,
  cutTreeX,
  flattenTreeHorizontally,
  flattenTreeVertically,
  measureDepth,
  getResolveOrderBy,
} = require('./../threaded-comments')

describe('Comment Tree Utilities', () => {
  let root
  let comments

  beforeEach(() => {
    root = {}
    comments = [
      { id: '1', parentIds: [], score: 10, createdAt: new Date('2023-01-01') },
      {
        id: '2',
        parentIds: ['1'],
        score: 5,
        createdAt: new Date('2023-01-02'),
      },
      {
        id: '3',
        parentIds: ['1'],
        score: 15,
        createdAt: new Date('2023-01-03'),
      },
      {
        id: '4',
        parentIds: ['1', '2'],
        score: 2,
        createdAt: new Date('2023-01-04'),
      },
    ]
  })

  describe('assembleTree', () => {
    test('should build a nested tree structure from flat array', () => {
      assembleTree(root, comments)

      expect(root.comments.nodes).toHaveLength(1) // Comment 1
      expect(root.comments.nodes[0].id).toBe('1')
      expect(root.comments.nodes[0]._depth).toBe(0)

      const childrenOf1 = root.comments.nodes[0].comments.nodes
      expect(childrenOf1).toHaveLength(2) // 2 and 3
      expect(childrenOf1.map((c) => c.id).sort()).toEqual(['2', '3'])

      const child2 = childrenOf1.find((c) => c.id === '2')
      expect(child2.comments.nodes).toHaveLength(1) // 4
      expect(child2.comments.nodes[0].id).toBe('4')
      expect(child2.comments.nodes[0]._depth).toBe(2)
    })

    test('should handle empty comments array', () => {
      assembleTree(root, [])
      expect(root.comments.nodes).toEqual([])
    })
  })

  describe('measureTree', () => {
    test('should count children correctly recursively', () => {
      assembleTree(root, comments)
      measureTree(root)

      expect(root.totalRepliesCount).toBe(4)

      const node1 = root.comments.nodes[0]
      expect(node1.totalRepliesCount).toBe(3)
      expect(node1.comments.directTotalCount).toBe(2) // 2 and 3

      const node2 = node1.comments.nodes.find((c) => c.id === '2')
      expect(node2.totalRepliesCount).toBe(1)
    })
  })

  describe('deepSortTree', () => {
    test('should sort nodes based on score descending', () => {
      assembleTree(root, comments)

      const descSorter = (a, b) => b - a
      deepSortTree(root, descSorter, 'score', null, null, false)

      const childrenOf1 = root.comments.nodes[0].comments.nodes
      expect(childrenOf1[0].id).toBe('3') // Score 15
      expect(childrenOf1[1].id).toBe('2') // Score 5
    })

    test('should bubble up top values when bubbleSort is true', () => {
      const bubbleRoot = { id: null }
      const bubbleComments = [
        { id: 'A', parentIds: [], score: 1 },
        { id: 'B', parentIds: ['A'], score: 100 },
        { id: 'C', parentIds: [], score: 50 },
      ]

      assembleTree(bubbleRoot, bubbleComments)

      const descSorter = (a, b) => b - a
      deepSortTree(bubbleRoot, descSorter, 'score', null, null, true) // bubbleSort = true

      const topLevel = bubbleRoot.comments.nodes
      expect(topLevel[0].id).toBe('A') // Moved up because of child B(100)
      expect(topLevel[1].id).toBe('C')
      expect(topLevel[0].topValue).toBe(100)
    })
  })

  describe('filterTree', () => {
    test('should filter tree to keep only path to specific IDs', () => {
      assembleTree(root, comments)
      // We want to find node '4'. The tree should keep Root -> 1 -> 2 -> 4
      // Node '3' should be removed.

      const cursorEnv = { exceptIds: [] }
      const found = filterTree(root, ['4'], cursorEnv)

      expect(found).toBe(true)

      const node1 = root.comments.nodes[0]
      expect(node1.id).toBe('1')

      const childrenOf1 = node1.comments.nodes
      expect(childrenOf1).toHaveLength(1)
      expect(childrenOf1[0].id).toBe('2') // Node 3 removed

      expect(childrenOf1[0].comments.nodes[0].id).toBe('4')
    })

    test('should return false if ID not found', () => {
      assembleTree(root, comments)
      const found = filterTree(root, ['999'], { exceptIds: [] })
      expect(found).toBe(false)
      expect(root.comments.nodes).toHaveLength(0)
    })
  })

  describe('cutTreeX', () => {
    test('should cut tree at maxDepth', () => {
      assembleTree(root, comments)

      // we need to measure the tree before we cut it.
      measureTree(root)

      cutTreeX(root, 1)

      const node1 = root.comments.nodes[0]
      expect(node1.id).toBe('1')
      expect(node1.comments.nodes).toHaveLength(0)
      expect(node1.comments.pageInfo.hasNextPage).toBe(true)
    })
  })

  describe('flattenTreeHorizontally', () => {
    test('should flatten tree into array excluding root, destroying structure', () => {
      assembleTree(root, comments)

      const flattened = flattenTreeHorizontally(root)

      expect(flattened).toHaveLength(4)
      const ids = flattened.map((c) => c.id)
      expect(ids).toContain('1')
      expect(ids).toContain('4')

      expect(flattened[0].comments.nodes).toEqual([])
    })
  })

  describe('flattenTreeVertically', () => {
    test('should flatten tree preserving children arrays', () => {
      assembleTree(root, comments)

      const flattened = flattenTreeVertically(root)
      const ids = flattened.map((c) => c.id)

      expect(ids).toEqual(expect.arrayContaining(['1', '2', '3', '4']))

      const node1 = flattened.find((c) => c.id === '1')
      expect(node1.comments.nodes.length).toBeGreaterThan(0)
    })
  })

  describe('measureDepth', () => {
    test('should measure requested depth from GQL-like fields', () => {
      const fields = {
        nodes: {
          comments: {
            nodes: {
              comments: {},
            },
          },
        },
      }
      expect(measureDepth(fields)).toBe(2)

      const fields2 = {
        nodes: {
          comments: {
            nodes: {
              comments: {
                nodes: { comments: {} },
              },
            },
          },
        },
      }
      expect(measureDepth(fields2)).toBe(3)
    })

    test('should return 0 for empty fields', () => {
      expect(measureDepth({})).toBe(0)
    })
  })

  describe('getResolveOrderBy', () => {
    test('should return null if orderBy is not AUTO', () => {
      expect(getResolveOrderBy('DATE', 'VOTES', [])).toBe(null)
    })

    test('should return defaultOrder if provided and not AUTO', () => {
      expect(getResolveOrderBy('DATE', 'AUTO', [])).toBe('DATE')
    })

    test('should return DATE for recent comments', () => {
      const recentComments = [
        { createdAt: new Date() }, // Now
        { createdAt: new Date(Date.now() - 1000) },
      ]
      expect(getResolveOrderBy('AUTO', 'AUTO', recentComments)).toBe('DATE')
    })

    test('should return VOTES for old comments (> 72 hours)', () => {
      const oldComments = [
        { createdAt: new Date(Date.now() - 1000 * 60 * 60 * 73) }, // 73 hours ago
        { createdAt: new Date() },
      ]
      expect(getResolveOrderBy('AUTO', 'AUTO', oldComments)).toBe('VOTES')
    })
  })
})
