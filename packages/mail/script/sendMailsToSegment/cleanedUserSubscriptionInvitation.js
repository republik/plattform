const yargs = require('yargs')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const sendMailsToSegment = require('./sendMailsToSegment')

const argv = yargs
  .option('dry-run', {
    default: true,
  })
  .option('limit', {
    default: 1000,
  })
  .help()
  .version().argv

PgDb.connect().then(async (pgdb) => {
  if (argv.dryRun) {
    console.warn('In dry-run mode. Use --no-dry-run to send scheduled emails.')
  }

  const mail = {
    subject: 'Warum Sie von uns keine Newsletter mehr erhalten',
    templateName: 'cleaned_user_subscription_invitation',
  }

  const emailAddresses = pgdb.queryOneColumn(
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
    WHERE "createdAt" >= now() - '60 days'::interval
    LIMIT :limit
  `,
    { limit: argv.limit },
  )

  await sendMailsToSegment(emailAddresses, mail, {
    pgdb,
    argv,
  })
  await pgdb.close()
  console.log('Done!')
})
