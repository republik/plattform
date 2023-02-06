const { Consents } = require('@orbiting/backend-modules-auth')
const dayjs = require('dayjs')

const DONATE_POLICY_NAME = '5YEAR_DONATE_MONTHS'

const rewardSender = async (senderUserId, pledgeUserId, context) => {
  const { pgdb, t, mail } = context
  console.log('rewarding')

  const transaction = await pgdb.transactionBegin()

  try {
    // update count of subscribers

    const lastCount = await transaction.public.userAttributes.findFirst(
      { userId: senderUserId, name: 'futureCampaignAboCount' },
      { orderBy: { createdAt: 'desc' } },
    )

    const newCount = lastCount ? parseInt(lastCount.value, 10) + 1 : 1

    const count = await transaction.public.userAttributes.insertAndGet({
      userId: senderUserId,
      name: 'futureCampaignAboCount',
      value: newCount,
      supersededAt: lastCount ? lastCount.createdAt : null,
    })

    const currentCount = count?.value
    // fetch consent of campaign sender if month should be donated
    const hasUserConsentedToDonate = await Consents.statusForPolicyForUser({
      userId: senderUserId,
      policy: DONATE_POLICY_NAME,
      pgdb,
    })

    // if month should not be donated, add to current membership period
    if (!hasUserConsentedToDonate) {
      const activeMembership = await transaction.public.memberships.findOne({
        userId: senderUserId,
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

    // send email to campaign sender
    await mail.sendFutureCampaignSenderRewardMail(
      {
        senderUserId,
        pledgeUserId,
        count: currentCount,
        hasUserConsentedToDonate,
      },
      { pgdb, t },
    )
    // TODO slack message?
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw new Error(e) // TODO: Fehlermeldung
  }
}

module.exports = { rewardSender }
