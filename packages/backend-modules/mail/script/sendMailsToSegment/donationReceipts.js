#!/usr/bin/env node

require('@orbiting/backend-modules-env').config()
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const yargs = require('yargs')
const moment = require('moment')

const {
  prolongBeforeDate: getProlongBeforeDate,
} = require('@orbiting/backend-modules-republik-crowdfundings/graphql/resolvers/User')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const invoices = require('@orbiting/backend-modules-invoices')
const { AccessToken, transformUser } = require('@orbiting/backend-modules-auth')

const { DEFAULT_MAIL_FROM_ADDRESS } = process.env

const argv = yargs
  .option('dry-run', {
    default: true,
  })
  .option('year', {
    required: true,
  })
  .option('only')
  .help()
  .version().argv

const admin = {
  roles: ['admin'],
}

require('bluebird')
  .props({
    pgdb: PgDb.connect(),
    redis: Redis.connect(),
    t: require('@orbiting/backend-modules-translate').t,
  })
  .then(async (context) => {
    const { pgdb, redis, t } = context
    if (argv.dryRun) {
      console.warn('In dry-run mode. Use --no-dry-run to send emails.')
    }
    if (argv.only) {
      console.log(`Will only send to ${argv.only}`)
    }
    const cleanYear = moment(`${argv.year}`).format('YYYY')

    const usersWithTotal = await pgdb.query(
      `
      SELECT p."userId", SUM(pay.total)
      FROM payments pay
      JOIN "pledgePayments" pp ON pp."paymentId" = pay.id
      JOIN pledges p ON p.id = pp."pledgeId"
      LEFT JOIN "postfinancePayments" pfp ON pfp.mitteilung = pay.hrid
      WHERE
        pay.status = 'PAID' AND
        (
          (
            pfp.buchungsdatum IS NULL AND
            pay."createdAt" AT TIME ZONE 'Europe/Zurich' >= :begin AND
            pay."createdAt" AT TIME ZONE 'Europe/Zurich' <= :end
          )
          OR
          (
            pfp.buchungsdatum AT TIME ZONE 'Europe/Zurich' >= :begin AND
            pfp.buchungsdatum AT TIME ZONE 'Europe/Zurich' <= :end
          )
        )
      GROUP BY p."userId"
    `,
      {
        begin: `${cleanYear}-01-01`,
        end: `${cleanYear}-12-31`,
      },
    )
    console.log(
      `${usersWithTotal.length} users with paid pledges in ${cleanYear}`,
    )

    for (const userWithTotal of usersWithTotal) {
      const user = transformUser(
        await pgdb.public.users.findOne({ id: userWithTotal.userId }),
      )
      if (argv.only && user.email !== argv.only && user.id !== argv.only) {
        continue
      }
      const { locale } = user._raw

      const emailSubject = t(`api/email/${locale}/donation_receipt/subject`, {
        year: cleanYear,
      })

      const prolongBeforeDate = await getProlongBeforeDate(
        user,
        { ignoreAutoPayFlag: true },
        { pgdb, user: admin, redis },
      )
      const prolongThisYear =
        moment(prolongBeforeDate).format('YYYY') === moment().format('YYYY')
      const prolongToken =
        prolongThisYear && AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

      const pdf = (
        await invoices.donationReceipt.generate(
          {
            year: cleanYear,
            user,
          },
          context,
        )
      ).toString('base64')

      if (argv.dryRun) {
        continue
      }

      await sendMailTemplate(
        {
          to: user.email,
          fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
          subject: emailSubject,
          templateName: `${locale}/donation_receipt`,
          globalMergeVars: [
            {
              name: 'name',
              content: user.name,
            },
            {
              name: 'prolong_token',
              content: prolongToken,
            },
          ],
          attachments: [
            {
              type: 'application/pdf',
              name: `Lobbywatch ${emailSubject}.pdf`,
              content: pdf,
            },
          ],
        },
        context,
        {
          onceFor: {
            type: 'donation_receipt',
            userId: user.id,
            keys: [`year:${cleanYear}`],
          },
        },
      )
    }

    Redis.disconnect(redis)
    await pgdb.close()
    console.log('Done!')
  })
