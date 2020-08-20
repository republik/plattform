const { count } = require('../../../lib/memberStats')

module.exports = (_, args, context) => ({
  count: count(context)
})
