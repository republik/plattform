const moment = require('moment')
const Promise = require('bluebird')
const debug = require('debug')('republik:script:sendPendingConfirmMails')

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const { sendPledgeConfirmations } = require('../modules/crowdfundings/lib/Mail')
const t = require('../lib/t')

const run = async () => {
  const pgdb = await PgDb.connect()

  const after = moment().subtract(1, 'days')
  debug('find pledges created after: %s', after.toISOString())

  const unconfirmedPledges = await pgdb.public.pledges.find({
    sendConfirmMail: true,
    status: 'SUCCESSFUL',
    'createdAt >=': after
  })
  debug('unconfirmedPledges: %d', unconfirmedPledges.length)

  const affectedUsers =
    unconfirmedPledges.length > 0
      ? await pgdb.public.users.find({
        id: unconfirmedPledges.map(pledge => pledge.userId),
        verified: true
      })
      : []
  debug('affectedUsers: %d', affectedUsers.length)

  if (affectedUsers.length > 0) {
    await Promise.each(
      affectedUsers,
      ({ id: userId }) => {
        debug('sendPledgeConfirmations', { userId })
        return sendPledgeConfirmations({ userId, pgdb, t })
      }
    )
  }

  debug('done')

  pgdb.close()
}

run().finally(process.exit)
