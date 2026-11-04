/**
 * Lib to search mailLog
 */
const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const maillog = require('./maillog')

/**
 * Returns a "connection" object with data nodes, pagination info and total
 * count of nodes
 */
const getConnection = (user, args, { pgdb }) => {
  const countFn = async (args) => {
    const { after, before } = args

    const filters = after?.filters || before?.filters || args.filters || {}

    return maillog.count({ user, filters }, pgdb)
  }

  const nodesFn = async (args) => {
    const { after, before } = args

    const size = after?.first || before?.first || args.first || 10
    const filters = after?.filters || before?.filters || args.filters || {}

    return maillog.find({ user, size, filters }, { after, before }, pgdb)
  }

  const pageInfoFn = (args, payload) => {
    const { after, before } = args
    const { nodes } = payload

    const first = after?.first || before?.first || args.first || 10
    const count =
      (after?.count && after.count + nodes.length) ||
      (before?.count && before.count - nodes.length) ||
      nodes.length

    if (!nodes.length) {
      return {
        hasNextPage: false,
        end: null,
        hasPreviousPage: false,
        start: null,
      }
    }

    return {
      hasNextPage: count < payload.totalCount,
      end: { first, date: nodes[nodes.length - 1].date, count },
      hasPreviousPage: count > first,
      start: { first, date: nodes[0].date, count },
    }
  }

  return pageini(args, countFn, nodesFn, pageInfoFn)
}

module.exports = {
  getConnection,
}
