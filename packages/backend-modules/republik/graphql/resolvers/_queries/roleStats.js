const { count } = require('../../../lib/roleStats')

const ALLOWED_ROLES = ['member', 'climate']
// role climate was introduced with climate lab exploration phase in January 2023
// this role has no effect anymore but can be used for statistical purposes (or Counter components)

module.exports = async (_, args, context) => {
  const { role } = args
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return
  }
  return { count: await count(role, context) }
}
