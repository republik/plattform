const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const dayjs = require('dayjs')

const sendMailsToSegment = require('./sendMailsToSegment')

const argv = yargs
  .option('dry-run', {
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

  console.log(dayjs(argv.to).format('YYYY-MM-DD'))
  console.log(dayjs(argv.from).format('YYYY-MM-DD'))
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
          "createdAt",
          EXTRACT(DAYS FROM now() - "createdAt") days,
          type
          
        FROM "mailchimpLog"
        WHERE
          type IN ('subscribe', 'unsubscribe', 'cleaned')
        ORDER BY "email", "createdAt" DESC
      )
      
      SELECT data.*
      FROM data
      JOIN users u 
        ON data.email = u.email
      JOIN memberships m 
        ON m."userId" = u.id AND m."active" = TRUE
      WHERE 
        type IN ('cleaned')
      ORDER BY data."createdAt" DESC
    )
    
    SELECT email 
    FROM records 
    WHERE 
      "createdAt" >= :from AND
      "createdAt" <= :to
  `,
    { from: argv.from, to: argv.to },
  )

  await sendMailsToSegment(emailAddresses, mail, {
    pgdb,
    argv,
  })
  await pgdb.close()
  console.log('Done!')
})
