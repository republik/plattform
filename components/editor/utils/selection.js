import { Map } from 'immutable'

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
