const debug = require('debug')('crowdfundings:lib:CustomPackages:rule:earlyUserBonus')
const moment = require('moment')
const uuid = require('uuid/v4')

const { getLatestPeriod } = require('../../utils')

const MEMBERSHIP_CREATED_BEFORE = '2017-04-27'
const PACKAGE_ELIGABLE = ['ABO', 'BENEFACTOR']

module.exports = ({ package_, packageOption, membership, payload, now }) => {
  if (membership.createdAt >= moment(MEMBERSHIP_CREATED_BEFORE)) {
    debug(
      'membership.createdAt not within early adopter range (< %s)',
      MEMBERSHIP_CREATED_BEFORE
    )
    return
  }

  if (!PACKAGE_ELIGABLE.includes(membership.pledge.package.name)) {
    debug(
      'package "%s" is not eligable for early adopter bonus',
      membership.pledge.package.name
    )
    return
  }

  if (payload.additionalPeriods.length !== 1) {
    debug(
      'too many or few additional periods (%d)',
      payload.additionalPeriods.length
    )
    return
  }

  const { beginDate, endDate } =
    getLatestPeriod(payload.additionalPeriods)

  const bonusInterval = moment(beginDate).diff(now)

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
