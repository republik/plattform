const debug = require('debug')('preview:lib:preview')

const moment = require('moment')

const mailLib = require('./mail')

const begin = async ({ userId, contexts, pgdb, t }) => {
  debug('beginPreview')

  const transaction = await pgdb.transactionBegin()

  try {
    if (!contexts || !contexts.includes('preview')) {
      debug('no "preview" in contexts found')
      return
    }

    const user = await transaction.public.users.findOne({ id: userId })

    const request = await transaction.public.previewRequests.insertAndGet({
      userId: user.id
    })

    debug('request', { request })

    const event = await transaction.public.previewEvents.insertAndGet({
      previewRequestId: request.id,
      event: 'added'
    })

    debug('event', { event })

    await mailLib.sendOnboarding({ user, request, pgdb: transaction, t })

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

const findPending = (pgdb) => {
  debug('findPending')

  return pgdb.public.previewRequests.find({
    completedAt: null
  })
}

const sendNewsletter = async (request, users, pgdb) => {
  const user = users.find(user => user.id === request.userId)

  debug('sendNewsletter', { to: user.email })

  // Here follows a beautiful piece of code.

  await pgdb.public.previewEvents.insertAndGet({
    previewRequestId: request.id,
    event: 'newsletter'
  })

  return setComplete(user, pgdb)
}

const setComplete = (user, pgdb) =>
  pgdb.public.previewRequests.update(
    { userId: user.id },
    { completedAt: moment() }
  )

module.exports = {
  begin,
  findPending,
  sendNewsletter
}
