const debug = require('debug')('crowdfundings:lib:scheduler:upgrade')
const Promise = require('bluebird')

const { transformUser } = require('@orbiting/backend-modules-auth')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { countFormat } = require('@orbiting/backend-modules-formats')

const { getCount: getMembershipStatsCount } = require('@orbiting/backend-modules-republik/lib/MembershipStats/evolution')

const getOptions = async context => {
  const options = {}

  try {
    options.membershipsCount = await getMembershipStatsCount(context)
    debug('options.membershipsCount', options.membershipsCount)
  } catch (e) {
    console.warn(e)
  }

  return options
}

const findRecipients = (context) => {
  /**
   * Recipients must meet these criteria:
   * - membership of type MONTHLY_ABO
   * - membership active
   * - membership not cancelled
   * - "days behind" between 42 and 48 days
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
        m.id "membershipId",

        -- Days behind
        EXTRACT(DAYS FROM SUM(LEAST(now(), mp."endDate") - LEAST(now(), mp."beginDate"))) "daysBehind"

      FROM "users" u
      -- users memberships …
      JOIN "memberships" m ON m."userId" = u.id
        -- … which are active
        AND m.active = TRUE
        -- … and not cancelled
        AND m.renew = TRUE

      -- membership type "MONTHLY_ABO"
      JOIN "membershipTypes" mt ON mt.id = m."membershipTypeId"
        AND mt.name = 'MONTHLY_ABO'

      -- memberships periods
      JOIN "membershipPeriods" mp ON mp."membershipId" = m.id

      GROUP BY u.id, m.id
    )

    SELECT *
    FROM "eligables" e
    JOIN "users" u ON u.id = e."userId"

    -- Scope to days behind in membership between 42 and 48 days (7th week)
    WHERE e."daysBehind" BETWEEN 42 AND 48
  `)
}

const sendMail = (options, context) => recipient => {
  const { membershipsCount } = options
  const { t } = context

  const { name } = transformUser(recipient)

  const globalMergeVars = [
    {
      name: 'name',
      content: name.trim()
    },
    membershipsCount && {
      name: 'memberships_count',
      content: countFormat(membershipsCount)
    }
  ]

  const templatePayload = {
    to: recipient.email,
    subject: t('api/email/membership_owner_upgrade_monthly/subject'),
    templateName: 'membership_owner_upgrade_monthly',
    globalMergeVars
  }

  return sendMailTemplate(
    templatePayload,
    context,
    {
      onceFor: {
        type: 'membership_owner_upgrade_monthly',
        userId: recipient.userId,
        keys: [`membershipId:${recipient.membershipId}`]
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

  const options = await getOptions(context)

  await Promise.map(
    recipients,
    sendMail(options, context),
    { concurrency: 2 }
  )
}

module.exports = {
  inform
}
