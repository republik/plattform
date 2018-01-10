import { Map, Seq } from 'immutable'
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

export const allBlocks = value => {
  const allBlockPaths = value.blocks
    .map(n => tree.byId(value, n.key))
    .reduce((memo, path) => memo.push(path).concat(tree.ancestors(value, path)))

  console.log(
    allBlockPaths.map(p => value.getIn(p.concat('type')))
  )
}
