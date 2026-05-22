#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const uniq = require('lodash/uniq')
const rw = require('rw')

const { getTemplates, envMergeVars } = require('../../lib/sendMailTemplate')
const MandrillInterface = require('../../MandrillInterface')
const NodemailerInterface = require('../../NodemailerInterface')
const sendResultNormalizer = require('../../utils/sendResultNormalizer')
const shouldSendMessage = require('../../utils/shouldSendMessage')
const { send } = require('../../lib/mailLog')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_SUBJECT_PREFIX,
  SEND_MAILS_TAGS,
} = process.env

const TEMPLATE_NAME = 'six_month_gift_membership_renewal_notice'
const SUBJECT = 'Ihr Geschenk erneuert sich'

const argv = yargs
  .option('dry-run', { default: true })
  .option('once-for', { default: true })
  .help()
  .version().argv

PgDb.connect()
  .then(async (pgdb) => {
    if (argv.dryRun) {
      console.warn('In dry-run mode. Use --no-dry-run to send emails.')
    }

    if (argv.onceFor) {
      console.log(
        'onceFor set: each address receives this email only once. Use --no-once-for to override.',
      )
    }

    const input = rw.readFileSync('/dev/stdin', 'utf8')
    if (!input?.length) {
      throw new Error('Provide email addresses on stdin, one per line.')
    }

    const emails = uniq(
      input
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    console.log(`Read ${emails.length} email address(es)`)

    const users = await pgdb.public.users.find({ email: emails })
    console.log(`Found ${users.length} user(s) in DB`)

    const userMap = new Map(users.map((u) => [u.email.toLowerCase(), u]))
    const notFound = emails.filter((e) => !userMap.has(e.toLowerCase()))
    if (notFound.length) {
      console.warn(`No user found for: ${notFound.join(', ')}`)
    }

    const tags = []
      .concat(SEND_MAILS_TAGS?.split(',') || [])
      .concat(TEMPLATE_NAME)
      .filter(Boolean)

    const subject = SEND_MAILS_SUBJECT_PREFIX
      ? `[${SEND_MAILS_SUBJECT_PREFIX}] ${SUBJECT}`
      : SUBJECT

    const mergeValues = envMergeVars.reduce((acc, { name, content }) => {
      acc[name] = content
      acc[name.toLowerCase()] = content
      acc[name.toUpperCase()] = content
      return acc
    }, {})

    const { getHtml } = await getTemplates(TEMPLATE_NAME)
    const html = getHtml(mergeValues)

    for (const user of users) {
      const message = {
        to: [{ email: user.email }],
        subject,
        from_email: DEFAULT_MAIL_FROM_ADDRESS,
        from_name: DEFAULT_MAIL_FROM_NAME,
        html,
        merge_language: 'handlebars',
        global_merge_vars: envMergeVars,
        auto_text: true,
        tags,
      }

      if (argv.dryRun) {
        console.log(TEMPLATE_NAME, user.email)
        continue
      }

      const sendFunc = sendResultNormalizer(
        false,
        shouldSendMessage(message),
        async () => {
          const nodemailer = NodemailerInterface({ logger: console })
          if (nodemailer.isUsable({ templateName: TEMPLATE_NAME }, message)) {
            return nodemailer.send(message)
          }

          const mandrill = MandrillInterface({ logger: console })
          if (mandrill.isUsable({ templateName: TEMPLATE_NAME }, message)) {
            return mandrill.send(message, false, [])
          }

          return [{ error: 'No mailing interface usable', status: 'error' }]
        },
      )

      const onceFor = argv.onceFor
        ? { type: TEMPLATE_NAME, email: user.email, userId: user.id }
        : false

      const sentData = await send({
        log: { onceFor },
        sendFunc,
        message: { ...message, html: !!message.html },
        email: user.email,
        template: TEMPLATE_NAME,
        context: { pgdb },
      })

      if (!sentData) {
        console.log(TEMPLATE_NAME, user.email, 'already sent, skipping')
        continue
      }

      console.log(
        TEMPLATE_NAME,
        user.email,
        sentData.mailLogId,
        sentData.result,
      )
    }

    await pgdb.close()
    console.log('Done!')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
