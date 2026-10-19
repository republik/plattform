#!/usr/bin/env node
/**
 * Sends the data breach notice to the email addresses given on stdin.
 *
 * Usage:
 *   node script/sendMailsToSegment/dataBreachNotice.js batch-*.txt             # dry run
 *   node script/sendMailsToSegment/dataBreachNotice.js batch-*.txt --no-dry-run
 *   cat emails.txt | node script/sendMailsToSegment/dataBreachNotice.js        # one batch on stdin
 *
 * Re-run the same command until nothing is sent anymore: addresses which
 * already received the mail are skipped (--once-for, default). Use
 * --no-once-for only for a list of addresses you want to mail again.
 *
 * Text: templates/data_breach_notice.html. The script refuses to send while
 * the template or subject still contain a TODO_ placeholder.
 */
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const fs = require('fs')
const rw = require('rw')

const sendMailsToSegment = require('../../lib/sendMailsToSegment')
const { getTemplates } = require('../../lib/sendMailTemplate')

const TEMPLATE_NAME = 'data_breach_notice'
const SUBJECT =
  'Sicherheitsvorfall bei der Republik: Ihre Daten sind betroffen.'
const FROM_EMAIL = 'kontakt@republik.ch'
const FROM_NAME = 'Republik'
const PLACEHOLDER = 'TODO_'

const argv = yargs
  .option('dry-run', { default: true })
  .option('once-for', { default: true })
  .help()
  .version().argv

PgDb.connect()
  .then(async (pgdb) => {
    const { html } = await getTemplates(TEMPLATE_NAME)
    const hasPlaceholder =
      !html || html.includes(PLACEHOLDER) || SUBJECT.includes(PLACEHOLDER)

    if (hasPlaceholder) {
      if (!argv.dryRun) {
        throw new Error(
          `Refusing to send: template "${TEMPLATE_NAME}" is missing or subject/template still contain ${PLACEHOLDER} placeholders.`,
        )
      }
      console.warn(
        `WARNING: template/subject still contain ${PLACEHOLDER} placeholders, a real run would be refused.`,
      )
    }

    if (argv.dryRun) {
      console.warn('In dry-run mode. Use --no-dry-run to send emails.')
    }
    if (argv.onceFor) {
      console.log(
        'onceFor set: each address receives this email only once. Use --no-once-for to override.',
      )
    }

    // batch files as arguments (e.g. batches of 4000), or one batch on stdin
    const files = argv._.map(String)
    const batches = files.length
      ? files.map((file) => ({
          name: file,
          input: fs.readFileSync(file, 'utf8'),
        }))
      : [{ name: 'stdin', input: rw.readFileSync('/dev/stdin', 'utf8') }]

    const parse = (input) => [
      ...new Set(
        (input || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      ),
    ]

    let total = 0
    let notSent = 0
    for (const [index, batch] of batches.entries()) {
      const emails = parse(batch.input)
      if (!emails.length) {
        console.warn(`Batch ${batch.name} is empty, skipping`)
        continue
      }
      total += emails.length
      console.log(
        `Batch ${index + 1}/${batches.length} (${batch.name}): ${
          emails.length
        } address(es)`,
      )

      await sendMailsToSegment(
        emails,
        {
          subject: SUBJECT,
          templateName: TEMPLATE_NAME,
          fromEmail: FROM_EMAIL,
          fromName: FROM_NAME,
        },
        pgdb,
        { dryRun: argv.dryRun, onceFor: argv.onceFor },
      )

      if (!argv.dryRun) {
        // recipients without a SENT row still need a rerun
        const sent = await pgdb.public.mailLog.count({
          type: TEMPLATE_NAME,
          email: emails,
          status: ['SENT', 'SCHEDULED'],
        })
        notSent += emails.length - sent
        console.log(
          `Batch ${batch.name}: ${sent} of ${emails.length} have a SENT/SCHEDULED mailLog row`,
        )
      }
    }

    if (!total) {
      throw new Error(
        'Provide email addresses as batch files or on stdin, one per line.',
      )
    }
    if (!argv.dryRun && notSent > 0) {
      console.warn(
        `${notSent} of ${total} address(es) not mailed yet. Re-run the same command.`,
      )
    }

    await pgdb.close()
    console.log('Done!')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
