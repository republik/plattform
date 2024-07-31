const debug = require('debug')('mail:lib:scheduler:cleanedUser')
const sendMailsToSegment = require('@orbiting/backend-modules-mail/lib/sendMailsToSegment')
const dayjs = require('dayjs')

module.exports = async (from, to, { pgdb }, dryRun = false, onceFor = true) => {
  const mail = {
    subject: 'Warum Sie von uns keine Newsletter mehr erhalten',
    templateName: 'cleaned_user_subscription_invitation',
  }

  const cleanedUsers = await pgdb.query(
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
  
  SELECT email, "firedAt" 
  FROM records 
  WHERE "firedAt" BETWEEN :from AND :to
`,
    { from, to },
  )
  debug(
    `%i email addresses found (from: %s, to: %s)`,
    cleanedUsers.length,
    from,
    to,
  )

  const emailAddressCleanedDateMap = new Map(
    cleanedUsers.map((entry) => {
      return [entry.email, dayjs(entry.firedAt).format('YYYY-MM-DD')]
    }),
  )

  await sendMailsToSegment([...emailAddressCleanedDateMap.keys()], mail, pgdb, {
    emailAddressCleanedDateMap,
    dryRun,
    onceFor,
  })
}
