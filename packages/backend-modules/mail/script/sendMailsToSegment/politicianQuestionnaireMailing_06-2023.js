#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const { csvParse } = require('d3-dsv')
const fs = require('fs').promises
const BluePromise = require('bluebird')

const sendResultNormalizer = require('../../utils/sendResultNormalizer')
const shouldScheduleMessage = require('../../utils/shouldScheduleMessage')
const shouldSendMessage = require('../../utils/shouldSendMessage')
const { getTemplates } = require('../../lib/sendMailTemplate')
const NodemailerInterface = require('../../NodemailerInterface')
const MandrillInterface = require('../../MandrillInterface')
const { error } = require('console')
const { DEFAULT_MAIL_FROM_NAME } = process.env

const debug = require('debug')(
  'mail:script:politicianQuestionnaireMailing_06-2023',
)

const argv = yargs
  .option('dry-run', {
    default: true,
  })
  .option('file', {
    default: 'local/test_politicians.csv',
  })
  .help()
  .version().argv

if (argv.dryRun) {
  console.warn('In dry-run mode. Use --no-dry-run to send emails.')
}

const mailInfo = {
  message: {
    subject: 'Letzte Erinnerung: Sommerfragebogen der Republik',
    templateName: 'questionnaire_politician_reminder_2',
  },
}

const from_email = 'fragebogen-wahlen@republik.ch'
const from_name = DEFAULT_MAIL_FROM_NAME

const requiredColumns = ['firstname', 'lastname', 'email', 'uuid', 'link']

debug(mailInfo)

const sendQuestionnaireInvitations = async () => {
  console.log(
    `Starting to unpack politician emails and data from CSV file ${argv.file}...`,
  )

  const emailsRaw = await fs.readFile(argv.file, 'utf-8')

  const emailArray = csvParse(emailsRaw)

  const columns = emailArray.columns
  debug(columns)

  const checkColumns = requiredColumns.every((c) =>
    emailArray.columns.includes(c),
  )

  if (!checkColumns) {
    throw error(
      `Wrong CSV file, probably. Existing columns are ${columns}, required columns are ${requiredColumns}.`,
    )
  }

  delete emailArray.columns

  emailArray.map((emailData) => {
    emailData.globalMergeVars = []
    columns.forEach((c) => {
      const tempObj = {}
      tempObj.name = c
      tempObj.content = emailData[c]
      emailData.globalMergeVars.push(tempObj)
    })
  })

  debug(emailArray[0].globalMergeVars[3])

  console.log(
    `Found ${emailArray.length} email addresses. Starting to send emails...`,
  )

  const errors = []

  await BluePromise.each(emailArray, async (emailData) => {
    const templateName = mailInfo.message?.templateName

    const values = emailData?.globalMergeVars?.reduce((prev, curr) => {
      const { name, content } = curr

      prev[name] = content
      prev[name.toLowerCase()] = content
      prev[name.toUpperCase()] = content
      return prev
    }, {})

    debug(values)

    const { getHtml, getText } = await getTemplates(templateName)
    const html = getHtml(values)
    const text = getText(values)
    const to = [
      {
        email: values.email,
        name: values.firstname + ' ' + values.lastname,
      },
    ]
    const mail = { templateName }
    const subject = mailInfo.message.subject

    const message = {
      to,
      from_email,
      from_name,
      subject,
      mailInfo,
      html,
      text,
    }

    const sendFunc = sendResultNormalizer(
      shouldScheduleMessage(mail, message),
      shouldSendMessage(message),
      async () => {
        // Backup method to send emails
        const nodemailer = NodemailerInterface({ logger: console })
        if (nodemailer.isUsable(mail, message)) {
          if (argv.dryRun) {
            return [{ status: 'sent', interface: 'Nodemailer' }]
          }

          return nodemailer.send(message)
        }

        // Default method to send emails
        const mandrill = MandrillInterface({ logger: console })
        if (mandrill.isUsable(mail, message)) {
          if (argv.dryRun) {
            return [{ status: 'sent', interface: 'Mandrill' }]
          }

          return mandrill.send(
            message,
            !message.html ? mail.templateName : false,
            [],
          )
        }

        return [{ error: 'No mailing interface usable', status: 'error' }]
      },
    )

    if (argv.dryRun) {
      console.log(emailData.email, templateName)
      return
    }

    const { result, status, error } = await sendFunc()

    if (error) {
      errors.push({
        email: emailData.email,
        uuid: emailData.uuid,
        result: result,
        status: status,
        error: error,
      })
    }

    console.log(
      emailData.email,
      emailData.uuid,
      templateName,
      result,
      status,
      error,
    )
  })

  return errors
}

sendQuestionnaireInvitations()
  .then((errors) => {
    if (errors.length > 0) {
      console.log(errors)
    }
  })
  .catch((err) => {
    console.error(`Èrror while trying to send emails: ${err}`)
  })
