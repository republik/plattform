const moment = require('moment')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { applyPgInterval: { add: addInterval } } = require('@orbiting/backend-modules-utils')

const formatDate = (date) => moment(date).format('YYYYMMDD')

module.exports = async ({ user, prolongBeforeDate }, bucket, context) => {
  const { id: userId, membershipGraceInterval } = user

  const templatePayload = await context.mail.prepareMembershipOwnerNotice({
    user,
    endDate: prolongBeforeDate,
    cancelUntilDate: moment(prolongBeforeDate).subtract(2, 'days'),
    graceEndDate: addInterval(
      prolongBeforeDate,
      membershipGraceInterval
    ),
    templateName: bucket.payload.templateName
  }, context)

  return sendMailTemplate(
    templatePayload,
    context,
    {
      onceFor: {
        type: bucket.payload.templateName,
        userId,
        keys: [`endDate:${formatDate(prolongBeforeDate)}`]
      }
    }
  )
}
