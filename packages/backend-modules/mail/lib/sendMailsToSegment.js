const debug = require('debug')('mail:lib:sendMailsToSegment')
const Promise = require('bluebird')

const { getTemplates, envMergeVars } = require('./sendMailTemplate')
const MandrillInterface = require('../MandrillInterface')
const NodemailerInterface = require('../NodemailerInterface')
const sendResultNormalizer = require('../utils/sendResultNormalizer')
const shouldSendMessage = require('../utils/shouldSendMessage')
const { send } = require('./mailLog')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_SUBJECT_PREFIX,
  SEND_MAILS_TAGS,
} = process.env

module.exports = async (segment, mail, pgdb, data) => {
  const { accessEventData, emailAddressCleanedDateMap } = data
  const tags = []
    .concat(SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(','))
    .concat(mail.templateName && mail.templateName)
    .filter(Boolean)

  const mergeVars = [...(mail.globalMergeVars || []), ...envMergeVars].filter(
    Boolean,
  )

  const values = mergeVars.reduce((prev, curr) => {
    const { name, content } = curr

    prev[name] = content
    prev[name.toLowerCase()] = content
    prev[name.toUpperCase()] = content
    return prev
  }, {})

  const { getHtml } = await getTemplates(
    mail.templateName,
  )

  const html = getHtml(values)

  const message = {
    subject:
      (SEND_MAILS_SUBJECT_PREFIX &&
        `[${SEND_MAILS_SUBJECT_PREFIX}] ${mail.subject}`) ||
      mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    html,
    merge_language: 'handlebars',
    global_merge_vars: envMergeVars,
    auto_text: true,
    tags,
    attachments: mail.attachments,
  }

  debug({
    ...message,
    numberAddressesInSegment: segment.length,
  })

  await Promise.each(segment, async (emailAddress) => {
    message.to = [{ email: emailAddress }]

    const sendFunc = sendResultNormalizer(
      false, // shouldScheduleMessage
      shouldSendMessage(message),
      async () => {
        // Backup method to send emails
        const nodemailer = NodemailerInterface({ logger: console })
        if (nodemailer.isUsable(mail, message)) {
          return nodemailer.send(message)
        }

        // Default method to send emails
        const mandrill = MandrillInterface({ logger: console })
        if (mandrill.isUsable(mail, message)) {
          return mandrill.send(
            message,
            !message.html ? mail.templateName : false,
            [],
          )
        }

        return [{ error: 'No mailing interface usable', status: 'error' }]
      },
    )

    if (data.dryRun) {
      console.log(mail.templateName, emailAddress)
      return
    }

    const onceFor = data.onceFor
      ? {
          type: mail.templateName,
          email: emailAddress,
          keys:
            emailAddressCleanedDateMap &&
            emailAddressCleanedDateMap.get(emailAddress)
              ? [`cleaned:${emailAddressCleanedDateMap.get(emailAddress)}`]
              : null,
        }
      : false

    const sentData = await send({
      log: { onceFor },
      sendFunc,
      message: {
        ...message,
        html: !!message.html,
        text: !!message.text,
        attachments: message.attachments?.map(({ name, type }) => ({
          name,
          type,
        })),
      },
      email: emailAddress,
      template: mail.templateName,
      context: { pgdb },
    })

    if (!sentData) {
      debug(`mail ${mail.templateName} already sent to ${emailAddress}`)
      return
    }

    const accessEvent =
      accessEventData &&
      (await pgdb.public.accessEvents.insertAndGet({
        accessGrantId: accessEventData.emailAddressGrantIdMap.get(emailAddress),
        event: accessEventData.event,
      }))

    console.log(
      mail.templateName,
      emailAddress,
      sentData.mailLogId,
      sentData.result,
      accessEvent?.id,
    )
  })
}
