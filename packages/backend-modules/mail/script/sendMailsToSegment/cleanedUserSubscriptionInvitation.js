const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')

const sendMailsToSegment = require('./sendMailsToSegment')

const argv = yargs
  .option('dry-run', {
    default: true,
  })
  .option('once-for', {
    default: true,
  })
  .option('from', {
    coerce: dayjs,
    default: dayjs().subtract(30, 'day'),
  })
  .option('to', {
    coerce: dayjs,
    default: dayjs(),
  })
  .help()
  .version().argv

PgDb.connect().then(async (pgdb) => {
  if (argv.dryRun) {
    console.warn('In dry-run mode. Use --no-dry-run to send emails to segment.')
  }

  // if script is executed less or exactly once every 3 months, we can switch off onceFor option
  if (argv.onceFor) {
    console.log(
      'onceFor set, i.e. mail template will be send to email address only once. Use --no-once-for to switch this off',
    )
  }

  console.log(
    `Fetching cleaned users between ${dayjs(argv.from).format(
      'YYYY-MM-DD',
    )} and ${dayjs(argv.to).format('YYYY-MM-DD')}`,
  )
  const mail = {
    subject: 'Warum Sie von uns keine Newsletter mehr erhalten',
    templateName: 'cleaned_user_subscription_invitation',
  }

  const emailAddresses = await pgdb.queryOneColumn(
    `
    WITH records AS (
      WITH data AS (
        SELECT
          DISTINCT ON ("email")
          "email",
          "firedAt",
          type
          
        FROM "mailchimpLog"
        WHERE
          type IN ('subscribe', 'unsubscribe', 'cleaned')
        ORDER BY "email", "firedAt" DESC
      )
      
      SELECT data.*
      FROM data
      JOIN users u 
        ON data.email = u.email
      JOIN memberships m 
        ON m."userId" = u.id AND m."active" = TRUE
      WHERE 
        type IN ('cleaned')
      ORDER BY data."firedAt" DESC
    )
    
    SELECT email 
    FROM records 
    WHERE "firedAt" BETWEEN :from AND :to
  `,
    { from: argv.from, to: argv.to },
  )

  console.log(`${emailAddresses.length} email addresses found`)

  await sendMailsToSegment(emailAddresses, mail, {
    pgdb,
    argv,
  })
  await pgdb.close()
  console.log('Done!')
})
