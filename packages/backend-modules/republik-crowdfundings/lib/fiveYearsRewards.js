const { Consents } = require('@orbiting/backend-modules-auth')
const dayjs = require('dayjs')

const { send5YearsRewardsMail } = require('@orbiting/backend-modules-mail')

const DONATE_POLICY_NAME = '5YEAR_DONATE_MONTHS'

const rewardSender = async (giverUserId, claimerUserId, context) => {
  const { pgdb, t } = context

  const transaction = await pgdb.transactionBegin()

  try {
    // update count of subscribers

    const lastCount = transaction.public.userAttributes.findFirst(
      { userId: giverUserId, name: 'mitstreiterCount' },
      { orderBy: { createdAt: 'desc' } },
    )

    const hasLastCount = lastCount.length

    const newCount = hasLastCount ? parseInt(lastCount[0].value, 10) + 1 : 1

    const count = await transaction.public.userAttributes.insertAndGet({
      userId: giverUserId,
      name: 'mitstreiterCount',
      value: newCount,
      supersededAt: hasLastCount ? lastCount[0].createdAt : null,
    })

    // fetch consent of giver if month should be donated
    const hasUserConsentedToDonate = Consents.statusForPolicyForUser({
      userId: giverUserId,
      policy: DONATE_POLICY_NAME,
      transaction,
    })

    // if month should not be donated, add to current membership period
    if (!hasUserConsentedToDonate) {
      const activeMembership = await transaction.public.memberships.findOne({
        userId: giverUserId,
        active: true,
      })

      const currentMembershipPeriod =
        await transaction.public.membershipPeriods.findFirst(
          {
            membershipId: activeMembership.id,
            pledgeId: activeMembership.pledgeId,
          },
          { orderBy: { endDate: 'asc' } },
        )

      const endDate = dayjs(currentMembershipPeriod.endDate)

      await transaction.public.membershipPeriods.updateAndGet(
        {
          id: currentMembershipPeriod.id,
          membershipId: activeMembership.id,
          pledgeId: activeMembership.pledgeId,
        },
        {
          endDate: endDate.add(1, 'month'),
        },
      )
    }

    // send email to giver
    await send5YearsRewardsMail(
      { giverUserId, claimerUserId, count, hasUserConsentedToDonate },
      { transaction, t },
    )
    // TODO slack message?
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw new Error(t('')) // TODO: Fehlermeldung
  }
}

module.exports = { rewardSender }
