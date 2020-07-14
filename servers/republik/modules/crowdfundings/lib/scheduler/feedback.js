const debug = require('debug')('crowdfundings:lib:scheduler:feedback')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { countFormat } = require('@orbiting/backend-modules-formats')

const { getCount: getMembershipStatsCount } = require('../../../../lib/MembershipStats/evolution')

const getOptions = async (recipients, context) => {
  const options = {}

  try {
    options.membershipsCount = await getMembershipStatsCount(context)
    debug('options.membershipsCount', options.membershipsCount)
  } catch (e) {
    console.warn(e)
  }

  options.subscriptions = await context.pgdb.public.subscriptions.find({ userId: recipients.map(r => r.userId) })
  debug('options.subscriptions', options.subscriptions.length)

  options.grants = await context.pgdb.public.accessGrants.find({ granterUserId: recipients.map(r => r.userId) })
  debug('options.grants', options.grants.length)

  return options
}

const findRecipients = (context) => {
  /**
   * Recipients must meet these criteria:
   * - membership active
   * - membership not cancelled
   * - "days behind" between 14 and 20 days
   *
   * "days behind" are days a membership was active already. They are
   * calculated for each period and then summed up.
   *
   * A period can either
   *   a) be entirly in past
   *   b) have begun in past, but did not end yet (current period)
   *   c) be entirly in future
   *
   * And this formula is covering these states:
   *
   *   LEAST(now, endDate) - LEAST(now, beginDate)
   *
   * It thus calculates days behind:
   *
   * a) period in past:
   *    endDate - beginDate = x days behind
   *
   * b) period begun in past:
   *    now - beginDate = x days behind
   *
   * c) period in future:
   *    now - now = 0 days behind
   *
   */
  return context.pgdb.query(`
    WITH "eligables" AS (
      SELECT
        u.id "userId",

        -- Days behind
        EXTRACT(DAYS FROM SUM(LEAST(now(), mp."endDate") - LEAST(now(), mp."beginDate"))) "daysBehind"

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

    -- Scope to days behind a user between 14 and 20 days (3rd week)
    WHERE e."daysBehind" BETWEEN 14 AND 20
  `)
}

const sendMail = (options, context) => recipient => {
  const { membershipsCount, subscriptions, grants } = options
  const { t } = context

  const recipientSubscriptions = subscriptions.filter(s => s.userId === recipient.userId)
  const recipientGrants = grants.filter(g => g.granterUserId === recipient.userId)

  const { name } = transformUser(recipient)

  const globalMergeVars = [
    {
      name: 'name',
      content: name.trim()
    },
    membershipsCount && {
      name: 'memberships_count',
      content: countFormat(membershipsCount)
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

  if (!recipients.length) {
    debug('no recipients found')
    return
  }

  const options = await getOptions(recipients, context)

  await Promise.map(
    recipients,
    sendMail(options, context),
    { concurrency: 2 }
  )
}

module.exports = {
  inform
}
