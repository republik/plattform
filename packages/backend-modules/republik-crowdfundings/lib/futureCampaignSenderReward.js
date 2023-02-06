const { Consents } = require('@orbiting/backend-modules-auth')
const dayjs = require('dayjs')

const DONATE_POLICY_NAME = '5YEAR_DONATE_MONTHS'

const rewardSender = async (senderUserId, pledgeUserId, context) => {
  const { pgdb, t, mail } = context

  const transaction = await pgdb.transactionBegin()

  try {
    // update count of subscribers

    const lastCount = await transaction.public.userAttributes.findFirst(
      { userId: senderUserId, name: 'futureCampaignAboCount' },
      { orderBy: { createdAt: 'desc' } },
    )

    const newCount = lastCount ? parseInt(lastCount.value, 10) + 1 : 1

    if (newCount <= 5) {
      const count = await transaction.public.userAttributes.insertAndGet({
        userId: senderUserId,
        name: 'futureCampaignAboCount',
        value: newCount,
        supersededAt: lastCount ? lastCount.createdAt : null,
      })

      const currentCount = count?.value
      // fetch consent of campaign sender if month should be donated
      const hasDonateConsent = await Consents.statusForPolicyForUser({
        userId: senderUserId,
        policy: DONATE_POLICY_NAME,
        pgdb,
      })

      const rewardMailData = {
        senderUserId,
        pledgeUserId,
        count: currentCount,
        hasSenderConsentedToDonate: hasDonateConsent,
      }

      // if month should not be donated, add to current membership period
      if (!hasDonateConsent) {
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

        const updatedMembershipPeriod =
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

        rewardMailData.membershipPeriodEndDate =
          updatedMembershipPeriod[0]?.endDate
      }

      // send email to campaign sender without new membership period end date
      await mail.sendFutureCampaignSenderRewardMail(
        { ...rewardMailData },
        { pgdb, t },
      )

      // TODO slack message?
      await transaction.transactionCommit()
    }
  } catch (e) {
    await transaction.transactionRollback()
    console.error(e)
    throw new Error(t('')) // TODO: Fehlermeldung
  }
}

module.exports = { rewardSender }
