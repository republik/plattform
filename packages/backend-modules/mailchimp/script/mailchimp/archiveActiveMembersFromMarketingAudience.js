#!/usr/bin/env node

/**
 * Archives contacts from MAILCHIMP_MARKETING_AUDIENCE_ID who have an active
 * membership or Stripe subscription.
 *
 * Takes a Mailchimp audience export CSV as input (--file). Only emails present
 * in both the CSV and the active-members query are affected.
 *
 * Usage:
 *   # dry run (default)
 *   node archiveActiveMembersFromMarketingAudience.js --file /path/to/export.csv
 *
 *   # actually archive
 *   node archiveActiveMembersFromMarketingAudience.js --file /path/to/export.csv --no-dry-run
 */

require('@orbiting/backend-modules-env').config()

const fs = require('fs')
const csvParser = require('csv-parser')
const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const MailchimpInterface = require('../../build/MailchimpInterface').default

const argv = yargs
  .option('file', {
    description:
      'Path to Mailchimp audience export CSV (omit to read from stdin)',
    type: 'string',
  })
  .option('dry-run', {
    description: 'Preview without making changes',
    default: true,
    type: 'boolean',
  }).argv

const ACTIVE_MEMBERS_SQL = `
  WITH users_with_membership_data AS (
    SELECT
      u.id,
      u.email,
      count(m.id) active_membership_count,
      count(s.id) active_subscription_count
    FROM users u
    LEFT JOIN memberships m ON u.id = m."userId" AND m.active = true
    LEFT JOIN payments.subscriptions s ON u.id = s."userId" AND "endedAt" is null
    WHERE u.verified = true
    GROUP BY u.id, u.email
  )
  SELECT email FROM users_with_membership_data
  WHERE active_membership_count + active_subscription_count > 0
`

async function parseCsv(readStream) {
  const emails = []
  const stream = readStream.pipe(
    csvParser({
      mapHeaders: ({ header }) => header.toLowerCase(),
    }),
  )
  for await (const row of stream) {
    const email = row['email address'] ?? row['e-mail-adresse']
    if (email) {
      emails.push(email.toLowerCase().trim())
    }
  }
  return emails
}

async function main() {
  const { file, dryRun } = argv

  const { MAILCHIMP_MARKETING_AUDIENCE_ID } = process.env
  if (!MAILCHIMP_MARKETING_AUDIENCE_ID) {
    console.error('MAILCHIMP_MARKETING_AUDIENCE_ID is not set')
    process.exit(1)
  }

  let inputStream
  if (file) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`)
      process.exit(1)
    }
    console.log(`Parsing CSV: ${file}`)
    inputStream = fs.createReadStream(file)
  } else {
    console.log('Parsing CSV from stdin')
    inputStream = process.stdin
  }

  const csvEmails = await parseCsv(inputStream)
  console.log(`Contacts in CSV: ${csvEmails.length}`)

  const pgdb = await PgDb.connect()

  try {
    const rows = await pgdb.query(ACTIVE_MEMBERS_SQL)
    const activeEmails = new Set(rows.map((r) => r.email.toLowerCase().trim()))
    console.log(`Active members/subscribers in DB: ${activeEmails.size}`)

    const toArchive = csvEmails.filter((email) => activeEmails.has(email))
    console.log(`Contacts to archive: ${toArchive.length}`)

    if (dryRun) {
      console.log(`DRY RUN — ${toArchive.length} emails would be archived:`)
      toArchive.forEach((email) => console.log(` ${email}`))
      return
    }

    const mailchimp = MailchimpInterface({ logger: console })
    let succeeded = 0
    let failed = 0

    for (const email of toArchive) {
      const ok = await mailchimp.archiveMember(
        email,
        MAILCHIMP_MARKETING_AUDIENCE_ID,
      )
      if (ok) {
        console.log(`Archived: ${email}`)
        succeeded++
      } else {
        console.error(`Failed to archive: ${email}`)
        failed++
      }
    }

    console.log(`\nDone. Archived: ${succeeded}, Failed: ${failed}`)
  } finally {
    await pgdb.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
