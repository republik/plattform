#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Promise = require('bluebird')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { transformUser } = require('@orbiting/backend-modules-auth')
const mailLib = require('@orbiting/backend-modules-access/lib/mail')
const { t } = require('@orbiting/backend-modules-translate')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

PgDb.connect().then(async pgdb => {
  const accessCampaignId = '5b3329d8-5537-467c-b3d2-4cd6a95ef315'
  const campaign = await pgdb.public.accessCampaigns.findOne({ id: accessCampaignId })

  const grants = await pgdb.public.accessGrants.find({
    accessCampaignId,
    'invalidatedAt !=': null
    // recipientUserId: listArray.map(row => row['User ID'])
  })

  const userIds = grants.map(g => g.recipientUserId)

  // console.log(userIds)

  const users = await pgdb.public.users.find({ id: userIds })
    .then(users => users.map(transformUser))

  const pledges = await pgdb.public.pledges.find({
    userId: userIds,
    status: 'SUCCESSFUL',
    'createdAt >': new Date('2019-09-27')
  }, {
    orderBy: 'createdAt'
  })

  const memberships = await pgdb.public.memberships.find({
    userId: userIds,
    active: true
  })

  const recipients = users
    .filter(u => !memberships.map(m => m.userId).includes(u.id))
    .filter(u => !pledges.map(p => p.userId).includes(u.id))

  await Promise.map(
    recipients.slice(1, 2000),
    async recipient => {
      const to = recipient._raw.email

      const granter = recipient
      const grant = grants.find(g => g.recipientUserId === recipient._raw.id)

      const party = 'recipient'
      const template = 'expired_winback'

      await sendMailTemplate({
        to,
        fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
        subject: 'Wollen Sie es wirklich wissen?',
        templateName: `access_${party}_${template}`,
        globalMergeVars: await mailLib.getGlobalMergeVars(
          granter,
          recipient,
          campaign,
          grant,
          t,
          pgdb
        )
      }, { pgdb })

      console.log({ to })

      // await eventsLib.log(grant, `email.${party}.${template}`, pgdb)

      //   granter, recipient, campaign, grant, t, pgdb
    },
    { concurrency: 1 }
  )

  await pgdb.close()
})
