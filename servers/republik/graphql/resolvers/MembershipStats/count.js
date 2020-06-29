const moment = require('moment')

const { sumBucketProps } = require('../../../lib/MembershipStats/evolution')

module.exports = (_, args, context) => sumBucketProps(
  context,
  moment().format('YYYY-MM'),
  { add: ['active', 'overdue'] }
)
