const { getCount } = require('../../../lib/MembershipStats/evolution')

module.exports = async (_, args, context) => {
  try {
    const count = await getCount(context)
    return count
  } catch (e) {
    console.error(e)
    throw new Error(context.t('api/unexpected'))
  }
}
