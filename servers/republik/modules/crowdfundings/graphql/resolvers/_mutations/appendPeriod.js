const { Roles } = require('@orbiting/backend-modules-auth')
const moment = require('moment')
const membershipResolver = require('../Membership')

module.exports = async (_, { id, duration, durationUnit }, context) => {
  const { user: me, t, req } = context
  Roles.ensureUserHasRole(me, 'supporter')

  const transaction = await context.pgdb.transactionBegin()

  try {
    const membership = await transaction.public.memberships.findOne({ id })
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    if (!(await membershipResolver.canAppendPeriod(membership))) {
      if (!membership.active) {
        throw new Error(t('api/appendPeriod/inactive'))
      }
      throw new Error(t('api/appendPeriod/wrongMembershipType'))
    }

    if (duration <= 0) {
      throw new Error(t('api/appendPeriod/durationShouldBePositive', { duration }))
    }

    const beginDate = await getBeginDate(transaction, id)
    const endDate = getEndDate(beginDate, duration, durationUnit, t)

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
    console.error('appendPeriod', e, { req: req._log() })
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

function getEndDate (startDate, duration, durationUnit, t) {
  const startDateMoment = moment(startDate)

  if (!startDateMoment.isValid()) {
    throw new Error(t('api/appendPeriod/startDateNotValid'))
  }

  const endDateMoment = startDateMoment.add(duration, durationUnit)

  if (!endDateMoment.isValid()) {
    throw new Error(t('api/appendPeriod/durationOrDurationUnitNotValid', { duration, durationUnit }))
  }
  return endDateMoment.toDate()
}
