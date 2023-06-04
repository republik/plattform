const { count } = require('../../../lib/roleStats')

const ALLOWED_ROLES = ['member', 'climate']

module.exports = async (_, args, context) => {
  const { role } = args
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return
  }
  return { count: await count(role, context) }
}
