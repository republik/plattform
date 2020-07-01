const { Roles } = require('@orbiting/backend-modules-auth')
const moment = require('moment')

module.exports = async (_, { id, duration, durationUnit }, context) => {
  const { user: me, t, req } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const transaction = await context.pgdb.transactionBegin()

  try {
    const membership = await transaction.public.memberships.findOne({ id })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    if (duration <= 0) {
      throw new Error(t('api/appendPeriodToMembership/durationShouldBePositive', { duration }))
    }

    const beginDate = await getBeginDate(transaction, id)
    const endDate = getEndDate(beginDate, duration, durationUnit)

    await transaction.public.membershipPeriods.insert({
      membershipId: id,
      beginDate,
      endDate,
      kind: 'ADMIN'
    })

    const updatedMembership = await transaction.public.memberships.findOne({ id })
    await transaction.transactionCommit()
    return updatedMembership
  } catch (e) {
    await transaction.transactionRollback()
    console.error('appendPeriodToMembership', e, { req: req._log() })
    throw e
  }
}

async function getBeginDate (transaction, id) {
  const result = await transaction.public.membershipPeriods.findFirst({
    membershipId: id
  }, { fields: '"endDate"', orderBy: ['endDate desc'] })

  const now = new Date()

  if (!result) {
    return now
  }

  const lastEndDate = result.endDate

  if (now > lastEndDate) {
    return now
  }

  return lastEndDate
}

function getEndDate (startDate, duration, durationUnit) {
  const endDate = moment(startDate).add(duration, durationUnit).toDate()
  if (endDate.toString() === startDate.toString()) {
    throw new Error(`${startDate}, ${duration}, ${durationUnit}`)
  }
  return endDate
}
