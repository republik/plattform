const moment = require('moment')

const { Roles } = require('@orbiting/backend-modules-auth')
const { slugExists, create } = require('../../../lib/Voting')
const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

module.exports = async (_, { votingInput }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'editor'])

  const {
    slug,
    description,
    beginDate
  } = votingInput

  const transaction = await pgdb.transactionBegin()
  try {
    if (await slugExists(slug, transaction)) {
      throw new Error(t('api/voting/exists'))
    }

    const { id: discussionId } = await upsertDiscussion(null, {
      title: description,
      path: `${moment(beginDate).format('/YYYY/MM/DD')}/${slug}`
    }, {
      ...context,
      pgdb: transaction
    })

    const newVoting = await create({
      ...votingInput,
      discussionId
    }, transaction)

    await transaction.transactionCommit()

    return newVoting
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
