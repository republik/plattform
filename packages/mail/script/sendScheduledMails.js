#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const yargs = require('yargs')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const sendResultNormalizer = require('../utils/sendResultNormalizer')
const shouldScheduleMessage = require('../utils/shouldScheduleMessage')
const shouldSendMessage = require('../utils/shouldSendMessage')
const { getTemplate } = require('../lib/sendMailTemplate')
const NodemailerInterface = require('../NodemailerInterface')
const MandrillInterface = require('../MandrillInterface')

const argv = yargs
  .option('types', {
    type: 'array',
    default: []
  })
  .option('limit', {
    default: 1000
  })
  .option('dry-run', {
    default: true
  })
  .check(argv => {
    if (argv.types.length === 0) {
      return 'Check --types. Should contain at least one type.'
    }

    return true
  })
  .help()
  .version()
  .argv

PgDb.connect().then(async pgdb => {
  if (argv.dryRun) {
    console.warn('In dry-run mode. Use --no-dry-run to send scheduled emails.')
  }

  const records = await pgdb.public.mailLog.find(
    {
      status: 'SCHEDULED',
      type: argv.types
    },
    { orderBy: { createdAt: 'ASC' }, limit: argv.limit }
  )

  console.log(`${records.length} record(s) found`)

  await Promise.each(records, async record => {
    const templateName = record.info.template || record.type

    if (!templateName || templateName === 'no-template') {
      console.warn(`${record.id} has no template to send it with`)
      return
    }

    const mail = { templateName }
    const html = getTemplate(templateName)
    const message = { ...record.info.message, html }

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
            []
          )
        }

        return [{ error: 'No mailing interface usable', status: 'error' }]
      }
    )

    if (argv.dryRun) {
      console.log(record.id, templateName, record.email)
      return
    }

    const { result, status, error } = await sendFunc()

    console.log(record.id, templateName, record.email, result)

    await pgdb.public.mailLog.updateOne(
      { id: record.id },
      { result, status, error, updatedAt: new Date() }
    )
  })

  await pgdb.close()

  console.log('Done!')
})
