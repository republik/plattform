const moment = require('moment')

const { Roles } = require('@orbiting/backend-modules-auth')
const { slugExists, findBySlug, create } = require('../../../lib/Election')
const {
  Discussion: { upsert: upsertDiscussion },
} = require('@orbiting/backend-modules-discussions')

module.exports = async (_, { electionInput }, context) => {
  const { pgdb, user: me, t } = context
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'editor'])

  const { slug, description, beginDate } = electionInput

  const transaction = await pgdb.transactionBegin()
  try {
    if (await slugExists(slug, transaction)) {
      throw new Error(t('api/election/exists'))
    }

    /* Would be nice to have the possibility to set discussionId via electionInput
    because if discussion is created via publikator we cannot set id there */
    const { id: discussionId } = await upsertDiscussion(
      null,
      {
        title: description,
        path: `/election/${moment(beginDate).format('YYYY')}/diskutieren`,
      },
      {
        ...context,
        pgdb: transaction,
      },
    )

    await create(
      {
        ...electionInput,
        discussionId,
      },
      transaction,
    )

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  return findBySlug(slug, pgdb)
}
