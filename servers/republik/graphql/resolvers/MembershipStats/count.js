const moment = require('moment')

const { sumBucketProps } = require('../../../lib/MembershipStats/evolution')

module.exports = async (_, args, context) => {
  try {
    const sum = await sumBucketProps(
      context,
      moment().format('YYYY-MM'),
      { add: ['active', 'overdue'] }
    )

    return sum
  } catch (e) {
    console.error(e)
    throw new Error(context.t('api/unexpected'))
  }
}
