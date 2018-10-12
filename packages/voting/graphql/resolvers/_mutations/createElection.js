const moment = require('moment')

const { Roles } = require('@orbiting/backend-modules-auth')
const { slugExists, findBySlug, create } = require('../../../lib/Election')
const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

module.exports = async (_, { electionInput }, { pgdb, user: me, t }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter', 'editor'])

  const {
    slug,
    description,
    beginDate
  } = electionInput

  const transaction = await pgdb.transactionBegin()
  try {
    if (await slugExists(slug, transaction)) {
      throw new Error(t('api/election/exists'))
    }

    const { id: discussionId } = await upsertDiscussion(null, {
      title: description,
      documentPath: `${moment(beginDate).format('/YYYY/MM/DD')}/${slug}`
    }, transaction)

    await create({
      ...electionInput,
      discussionId
    }, transaction)

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  return findBySlug(slug, pgdb)
}
