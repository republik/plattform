const {
  TYPE,
  winbackCanBeSentForCancellationDate
} = require('../../lib/scheduler/winbacks')

module.exports = {
  async winbackSentAt ({ membershipId, id }, args, { pgdb }) {
    const userId = await pgdb.public.memberships.findOneFieldOnly(
      { id: membershipId },
      'userId'
    )
    const log = await pgdb.public.mailLog.findOne({
      userId,
      type: TYPE,
      'info @>': { membershipCancellationId: id },
      status: 'SENT'
    })
    return log && log.createdAt
  },
  winbackCanBeSent ({ createdAt }) {
    return winbackCanBeSentForCancellationDate(createdAt)
  }
}
