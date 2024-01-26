const { Roles } = require('@orbiting/backend-modules-auth')
const slack = require('@orbiting/backend-modules-republik/lib/slack')

const { throwError } = require('../../../lib/payments/stripe/Errors')
const createCache = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const {
    pgdb,
    user: me,
    t,
    mail: { enforceSubscriptions },
  } = context
  const now = new Date()
  const { id: membershipId } = args
  const transaction = await pgdb.transactionBegin()
  try {
    const membership = await transaction
      .query(
        `
      SELECT
        m.*
      FROM
        memberships m
      WHERE
        id = :membershipId
      FOR UPDATE
    `,
        {
          membershipId,
        },
      )
      .then((result) => result[0])
    if (!membership) {
      throw new Error(t('api/membership/404'))
    }

    const user = await transaction.public.users.findOne({
      id: membership.userId,
    })
    Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

    const activeMembership = await transaction.public.memberships.findFirst({
      'id !=': membershipId,
      userId: user.id,
      active: true,
    })
    if (activeMembership) {
      throw new Error(t('api/membership/reactivate/otherActive'))
    }

    const membershipType = await transaction.public.membershipTypes.findOne({
      id: membership.membershipTypeId,
    })

    let newMembership
    if (membershipType.name === 'MONTHLY_ABO') {
      throw new Error(t('api/membership/reactivateNotPossible'))
    } else if (
      [
        'ABO',
        'ABO_GIVE_MONTHS',
        'BENEFACTOR_ABO',
        'YEARLY_ABO',
        'MONTHLY_ABO_AUTOPAY',
      ].includes(membershipType.name)
    ) {
      if (membership.renew) {
        console.info('reactivateMembership: membership is already renew===true')
        await transaction.transactionCommit()
        return membership
      }

      if (!membership.active) {
        console.error(`reactivateMembership: unable to reactivate membership`)
        throw new Error(t('api/unexpected'))
      }

      newMembership = await transaction.public.memberships.updateAndGetOne(
        {
          id: membershipId,
        },
        {
          renew: true,
          updatedAt: now,
        },
      )
    } else {
      console.error(
        `reactivateMembership: membershipType "${membershipType.name}" not supported`,
      )
      throw new Error(t('api/unexpected'))
    }

    await transaction.transactionCommit()

    enforceSubscriptions({ pgdb, userId: membership.userId })

    await slack.publishMembership(
      user,
      me,
      membershipType.name,
      'reactivateMembership',
    )

    const cache = createCache({ prefix: `User:${user.id}` }, context)
    cache.invalidate()

    return newMembership
  } catch (e) {
    await transaction.transactionRollback()
    throwError(e, { membershipId, t, kind: 'reactivateMembership' })
  }
}
