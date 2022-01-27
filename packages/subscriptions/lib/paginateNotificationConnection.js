const { paginate } = require('@orbiting/backend-modules-utils')

module.exports = (args, nodes) =>
  paginate(args, nodes, {
    unreadCount: nodes.reduce((agg, n) => (!n.readAt ? agg + 1 : agg), 0),
  })
