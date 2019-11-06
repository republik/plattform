import { Map, List, Seq } from 'immutable'
import TreeUtils from 'immutable-treeutils'

const tree = new TreeUtils(Seq.of('document'), 'key', 'nodes')

const getClosest = (filter, node, value) => value.document.getClosest(node.key, filter)
const getFurthest = (filter, node, value) => value.document.getClosest(node.key, filter)

const getInSelection = selector => (filter, value) => {
  return value.blocks.reduce(
    (memo, node) => {
      const res = selector(filter, node, value)
      if (res) {
        return memo.set(res.key, res)
      }
      return memo
    },
    Map()
  )
}

export const getClosestInSelection = getInSelection(getClosest)
export const getFurthestInSelection = getInSelection(getFurthest)

const getAtEdge = (selector, edge) => (filter, value) => {
  return selector(filter, value[`${edge}Block`], value)
}

export const getClosestAtStart = getAtEdge(getClosest, 'start')
export const getClosestAtEnd = getAtEdge(getClosest, 'end')

export const getFurthestAtStart = getAtEdge(getFurthest, 'start')
export const getFurthestAtEnd = getAtEdge(getFurthest, 'end')

const createSelectionCache = () => {
  let currentValue
  let cache

  const invalidate = nextValue => {
    if (currentValue !== nextValue) {
      currentValue = nextValue
      cache = Map()
    }
  }

  return (prefix, fn) => (value, ...args) => {
    invalidate(value)
    const key = `${prefix}-${JSON.stringify(args)}`
    if (cache.has(key)) {
      return cache.get(key)
    }
    const res = fn(value, ...args)
    cache = cache.set(key, res)
    return res
  }
}

const selectionCache = createSelectionCache()

export const byId = selectionCache('byId', (value, id) =>
  tree.byId(value, id)
)

export const getAll = selectionCache('getAllBlocks', value => {
  return value.blocks
    .map(n => byId(value, n.key))
    .reduce((memo, path) => memo.push(path).concat(tree.ancestors(value, path)), List())
    .reduce((memo, path) => memo.set(tree.id(value, path), path), Map())
})

const getByType = selectionCache('getByType', (value, type) => {
  return getAll(value)
    .filter(p => value.getIn(p.concat('type')) === type)
})

const resolve = fn => (value, ...args) => {
  const res = fn(value, ...args)
  if (Map.isMap(res)) {
    return res.map(p => value.getIn(p))
  }
  return value.getIn(res)
}

export const allBlocks = selectionCache('allBlocks',
  resolve(getAll)
)

export const blockTypes = selectionCache('blockTypes',
  resolve(getByType)
)

export const parent = selectionCache('getParent',
  resolve((value, id) => tree.parent(value, byId(value, id)))
)

export const childIndex = selectionCache('childIndex',
  (value, id) => tree.childIndex(value, byId(value, id))
)

export const depth = selectionCache('depth',
  (value, id) => tree.depth(value, byId(value, id))
)
