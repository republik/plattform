const debug = require('debug')('crowdfundings:lib:scheduler:owners:mailings')
const moment = require('moment')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const {
  applyPgInterval: { add: addInterval },
} = require('@orbiting/backend-modules-utils')

const formatDate = (date) => moment(date).format('YYYYMMDD')

const DRY_RUN = process.env.DRY_RUN === 'true'

module.exports = async (user, payload, context) => {
  const { id: userId, membershipGraceInterval, prolongBeforeDate } = user
  const templateName = `${user._raw.locale}/${payload.templateName}`

  debug('send mailing: %o', { templateName, userId, prolongBeforeDate })

  const templatePayload = await context.mail.prepareMembershipOwnerNotice(
    {
      user,
      endDate: prolongBeforeDate,
      cancelUntilDate: moment(prolongBeforeDate).subtract(2, 'days'),
      graceEndDate: addInterval(prolongBeforeDate, membershipGraceInterval),
      templateName,
    },
    context,
  )

  if (DRY_RUN) {
    return
  }
  return sendMailTemplate(templatePayload, context, {
    onceFor: {
      type: templateName,
      userId,
      keys: [`endDate:${formatDate(prolongBeforeDate)}`],
    },
  })
}
