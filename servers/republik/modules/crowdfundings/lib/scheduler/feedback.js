const debug = require('debug')('crowdfundings:lib:scheduler:feedback')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const findRecipients = (context) => {
  return context.pgdb.query(`
    WITH "eligables" AS (
      SELECT
        u.id "userId",
      
        -- All periods expressed in days
        EXTRACT(DAYS FROM SUM(mp."endDate" - mp."beginDate")) "days",
      
        -- Days behind (a)
        EXTRACT(DAYS FROM SUM(LEAST(now(), mp."endDate") - LEAST(now(), mp."beginDate"))) "daysBehind",
        -- Days ahead (b)
        EXTRACT(DAYS FROM SUM(GREATEST(now(), mp."endDate") - GREATEST(now(), mp."beginDate"))) "daysAhead",
      
        -- is overdue?
        MAX(mp."endDate") < now() "isOverdue"
      
      FROM "users" u
      -- users memberships
      JOIN "memberships" m ON m."userId" = u.id
      -- memberships periods
      JOIN "membershipPeriods" mp ON mp."membershipId" = m.id
      
      -- A membership which is …
      JOIN "memberships" ma ON ma."userId" = u.id
        -- … still active
        AND ma.active = TRUE
        -- … not cancelled
        AND ma.renew = TRUE
      
      GROUP BY u.id
    )
    
    SELECT *
    FROM "eligables" e
    JOIN "users" u ON u.id = e."userId"

    -- Scope to days behind a user between 21 and 27 days (3rd week)
    WHERE e."daysBehind" BETWEEN 21 AND 27
  `)
}

const sendMail = (subscriptions, grants, context) => recipient => {
  const { t } = context

  const recipientSubscriptions = subscriptions.filter(s => s.userId === recipient.userId)
  const recipientGrants = grants.filter(g => g.granterUserId === recipient.userId)

  const { name } = transformUser(recipient)

  const globalMergeVars = [
    {
      name: 'name',
      content: name.trim()
    },
    {
      name: 'subscriptions_count',
      content: recipientSubscriptions.length
    },
    {
      name: 'grants_count',
      content: recipientGrants.length
    }
  ]

  const templatePayload = {
    to: recipient.email,
    subject: t('api/email/membership_owner_feedback/subject'),
    templateName: 'membership_owner_feedback',
    globalMergeVars
  }

  return sendMailTemplate(
    templatePayload,
    context,
    {
      onceFor: {
        type: 'membership_owner_feedback',
        userId: recipient.userId
      }
    }
  )
}

const inform = async function (args, context) {
  const recipients = await findRecipients(context)
  debug('recipients', recipients.length)

  const subscriptions = await context.pgdb.public.subscriptions.find({ userId: recipients.map(r => r.userId) })
  debug('all subscriptions by recipients', subscriptions.length)

  const grants = await context.pgdb.public.accessGrants.find({ granterUserId: recipients.map(r => r.userId) })
  debug('all grants by recipients', grants.length)

  await Promise.map(
    recipients,
    sendMail(subscriptions, grants, context),
    { concurrency: 1 }
  )
}

module.exports = {
  inform
}
