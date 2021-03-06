const decode = (input) => Buffer.from(input, 'base64').toString('utf-8')
const encode = (input) => Buffer.from(input, 'utf-8').toString('base64')

module.exports = (
  { first, last, after: _after, before: _before, only },
  nodes,
  additionalProps = {},
) => {
  const after = _after && decode(_after)
  const before = _before && decode(_before)

  const totalCount = nodes.length
  const firstIndex = 0
  const lastIndex = Math.max(totalCount - 1, 0)

  const beginOffset = after
    ? nodes.findIndex((n) => n.id === after) + 1
    : firstIndex
  // slice extracts up to but not including end
  const endOffset = before
    ? nodes.findIndex((n) => n.id === before)
    : lastIndex + 1

  let nodeSubset = only
    ? nodes.filter((n) => n.id === only)
    : nodes.slice(beginOffset, endOffset)

  const isLast = last && !first
  nodeSubset = isLast ? nodeSubset.slice(-1 * last) : nodeSubset.slice(0, first)

  const startCursor = nodeSubset.length && nodeSubset[0].id
  const endCursor = nodeSubset.length && nodeSubset.slice(-1)[0].id

  const hasPreviousPage =
    !!startCursor &&
    nodes.some((node, i) => node.id === startCursor && i > firstIndex)
  const hasNextPage =
    !!endCursor &&
    nodes.some((node, i) => node.id === endCursor && i < lastIndex)

  return {
    totalCount,
    ...additionalProps,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage ? encode(endCursor) : null,
      hasPreviousPage,
      startCursor: hasPreviousPage ? encode(startCursor) : null,
    },
    nodes: nodeSubset,
  }
}

const base64toObject = (base64) => {
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'))
  } catch (e) {}

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

  const beginOffset =
    after && after.id
      ? nodes.findIndex((n) => n.id === after.id) + 1
      : firstIndex
  // slice extracts up to but not including end
  const endOffset =
    before && before.id
      ? nodes.findIndex((n) => n.id === before.id)
      : lastIndex + 1

  let nodeSubset = only
    ? nodes.filter((n) => n.id === only)
    : nodes.slice(beginOffset, endOffset)

  const isLast = last && !first
  nodeSubset = isLast ? nodeSubset.slice(-1 * last) : nodeSubset.slice(0, first)

  const startCursor = nodeSubset.length && nodeSubset[0].id
  const endCursor = nodeSubset.length && nodeSubset.slice(-1)[0].id

  const hasPreviousPage =
    !!startCursor &&
    nodes.some((node, i) => node.id === startCursor && i > firstIndex)
  const hasNextPage =
    !!endCursor &&
    nodes.some((node, i) => node.id === endCursor && i < lastIndex)

  return {
    totalCount: nodes.length,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? objectToBase64({ id: endCursor, payload })
        : null,
      hasPreviousPage,
      startCursor: hasPreviousPage
        ? objectToBase64({ id: startCursor, payload })
        : null,
    },
    nodes: nodeSubset,
    _nodes: nodes,
  }
}

/**
 * Util which helps generating an GraphQL Cursor Connection. It allows to
 * pagination results.
 *
 * @see https://relay.dev/graphql/connections.htm
 *
 * This util implementation is somewhat superior to previous pagination
 * implementation ("paginate", "paginator") as it won't require all data and
 * then slice it.
 *
 * Flow:
 *
 * 1) Decode after and before cursors in {args}
 *
 * 2) Call {countFn} with {args}, after and before cursors. Its expected to
 *    return total count of nodes.
 *
 * 3) Call {nodesFn} with {args}, after and before cursors and total count. Its
 *    expected to return (sliced) nodes using provided arguments: a page.
 *
 * 4) Call {pageInfoFn} with {args}, cursors, total count and nodes. Its
 *    expected to return whether there is a next or previous page to "pagniate"
 *    to. Its expected to return start and end cursor.
 */
module.exports.pageini = async (args, countFn, nodesFn, pageInfoFn) => {
  const { after: _after, before: _before } = args

  const after = _after && base64toObject(_after)
  const before = _before && base64toObject(_before)

  const totalCount = (await countFn({ ...args, after, before })) || 0
  const nodes =
    (await nodesFn({ ...args, after, before }, { totalCount })) || []
  const { hasNextPage, end, hasPreviousPage, start } =
    (await pageInfoFn({ ...args, after, before }, { totalCount, nodes })) || {}

  const startCursor = start && objectToBase64(start)
  const endCursor = end && objectToBase64(end)

  return {
    pageInfo: {
      hasNextPage,
      endCursor,
      hasPreviousPage,
      startCursor,
    },
    totalCount,
    nodes,
  }
}
