const debug = require('debug')('crowdfundings:lib:CustomPackages:rule:earlyUserBonus')
const moment = require('moment')
const uuid = require('uuid/v4')

const { getLatestPeriod } = require('../../utils')

const MEMBERSHIP_CREATED_BEFORE = '2017-04-27'

module.exports = ({ package_, packageOption, membership, payload, now }) => {
  if (membership.createdAt >= moment(MEMBERSHIP_CREATED_BEFORE)) {
    debug('membership is not eligable for early adopter bonus')
    return
  }

  if (payload.additionalPeriods.length !== 1) {
    debug('not eligable, too many or few additional periods')
    return
  }

  const { endDate } =
    getLatestPeriod(payload.additionalPeriods)
  const { endDate: firstBeginDate } =
    getLatestPeriod(membership.membershipPeriods).endDate

  const bonusInterval = moment(firstBeginDate).diff(now)

  debug('earlyAdopterBonus granted', { bonusInterval })

  payload.additionalPeriods.push({
    id: uuid(), // TODO: Fake UUID, stitch together differently.
    membershipId: membership.id,
    kind: 'BONUS',
    beginDate: endDate,
    endDate: moment(endDate).add(moment.duration(bonusInterval)),
    createdAt: now,
    updatedAt: now
  })
}
