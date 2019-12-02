const decode = (input) => Buffer.from(input, 'base64').toString('utf-8')
const encode = (input) => Buffer.from(input, 'utf-8').toString('base64')

module.exports = (
  {
    first,
    last,
    after: _after,
    before: _before,
    only
  },
  nodes
) => {
  const after = _after && decode(_after)
  const before = _before && decode(_before)

  const totalCount = nodes.length
  const firstIndex = 0
  const lastIndex = Math.max(totalCount - 1, 0)

  const beginOffset = after
    ? nodes.findIndex(n => n.id === after) + 1
    : firstIndex
  // slice extracts up to but not including end
  const endOffset = before
    ? nodes.findIndex(n => n.id === before)
    : lastIndex + 1

  let nodeSubset = only
    ? nodes.filter(n => n.id === only)
    : nodes.slice(beginOffset, endOffset)

  const isLast = last && !first
  nodeSubset = isLast
    ? nodeSubset.slice(-1 * last)
    : nodeSubset.slice(0, first)

  const startCursor = nodeSubset.length && nodeSubset[0].id
  const endCursor = nodeSubset.length && nodeSubset.slice(-1)[0].id

  const hasPreviousPage = !!startCursor &&
    nodes.some((node, i) => node.id === startCursor && i > firstIndex)
  const hasNextPage = !!endCursor &&
    nodes.some((node, i) => node.id === endCursor && i < lastIndex)

  return {
    totalCount,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? encode(endCursor) : null,
      hasPreviousPage,
      startCursor: hasPreviousPage ? encode(startCursor) : null
    },
    nodes: nodeSubset
  }
}

const base64toObject = (base64) => {
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  } catch (e) {
  }

  return {}
}

const objectToBase64 = (object) =>
  Buffer.from(JSON.stringify(object), 'utf-8').toString('base64')

module.exports.paginator = (args, payloadFn, nodesFn) => {
  const { first, last, after: _after, before: _before, only } = args

  const after = _after && base64toObject(_after)
  const before = _before && base64toObject(_before)

  const payload = payloadFn({ ...args, after, before })
  const nodes = nodesFn({ ...args, after, before }, payload)

  const totalCount = nodes.length
  const firstIndex = 0
  const lastIndex = Math.max(totalCount - 1, 0)

  const beginOffset = after && after.id
    ? nodes.findIndex(n => n.id === after.id) + 1
    : firstIndex
  // slice extracts up to but not including end
  const endOffset = before && before.id
    ? nodes.findIndex(n => n.id === before.id)
    : lastIndex + 1

  let nodeSubset = only
    ? nodes.filter(n => n.id === only)
    : nodes.slice(beginOffset, endOffset)

  const isLast = last && !first
  nodeSubset = isLast
    ? nodeSubset.slice(-1 * last)
    : nodeSubset.slice(0, first)

  const startCursor = nodeSubset.length && nodeSubset[0].id
  const endCursor = nodeSubset.length && nodeSubset.slice(-1)[0].id

  const hasPreviousPage = !!startCursor &&
    nodes.some((node, i) => node.id === startCursor && i > firstIndex)
  const hasNextPage = !!endCursor &&
    nodes.some((node, i) => node.id === endCursor && i < lastIndex)

  return {
    totalCount: nodes.length,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? objectToBase64({ id: endCursor, payload }) : null,
      hasPreviousPage,
      startCursor: hasPreviousPage ? objectToBase64({ id: startCursor, payload }) : null
    },
    nodes: nodeSubset,
    _nodes: nodes
  }
}
