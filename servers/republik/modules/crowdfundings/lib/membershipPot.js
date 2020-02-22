// this code is ready for pledges of package DONATE* have multiple pledgeOptions
// it expects the pledge.total to be correctly distributed onto its pledgeOptions
const Promise = require('bluebird')

const generateMemberships = async (allPledgeOptions, customContext) => {
  const { pgdb } = customContext

  const potPledgeOptionIds = allPledgeOptions
    .map(plo => plo.potPledgeOptionId)
    .filter(Boolean)
    .filter((id, index, ids) => ids.lastIndexOf(id) === index) // uniq

  if (potPledgeOptionIds.length) {
    await Promise.each(
      potPledgeOptionIds,
      (id) => refreshPot(id, pgdb)
    )
  }
}

// don't change the price of the pot pledgeOption!! ever!
const refreshPot = async (potPledgeOptionId, pgdb) => {
  const txn = await pgdb.transactionBegin()
  try {
    const potPledge = await txn.queryOne(`
      SELECT *
      FROM pledges
      WHERE id = (SELECT "pledgeId" FROM "pledgeOptions" WHERE id = :potPledgeOptionId)
      FOR UPDATE
    `, {
      potPledgeOptionId
    })

    const potPledgeOption = await txn.queryOne(`
      SELECT
        *
      FROM
        "pledgeOptions"
      WHERE
        id = :potPledgeOptionId
      FOR UPDATE
    `, {
      potPledgeOptionId
    })

    const totalDonated = await txn.queryOneField(`
      SELECT
        sum(plo.total)
      FROM
        "pledgeOptions" plo
      JOIN
        pledges p
        ON
          plo."pledgeId" = p.id AND
          p.status = 'SUCCESSFUL'
      WHERE
        plo."potPledgeOptionId" = :potPledgeOptionId
    `, {
      potPledgeOptionId
    })

    const { price, amount } = potPledgeOption
    const donatedAmountOfMemberships = Math.floor(totalDonated / price)

    const surplusAmountOfDonatedMemberships = donatedAmountOfMemberships - amount

    console.log({ price, amount, donatedAmountOfMemberships, surplusAmountOfDonatedMemberships, totalDonated: totalDonated / 100 })

    if (surplusAmountOfDonatedMemberships > 0) {
      const potPackageOption = await txn.public.packageOptions.findOne({
        id: potPledgeOption.templateId
      })
      const membershipType = await txn.public.membershipTypes.findOne({
        rewardId: potPackageOption.rewardId
      })

      const now = new Date()
      await Promise.map(
        Array(surplusAmountOfDonatedMemberships),
        () => {
          console.log('insertMembership')
          return txn.public.memberships.insert({
            userId: potPledge.userId,
            pledgeId: potPledge.id,
            membershipTypeId: membershipType.id,
            initialInterval: membershipType.interval,
            initialPeriods: potPledgeOption.periods,
            reducedPrice: false,
            voucherable: false,
            active: false,
            renew: false,
            autoPay: false,
            accessGranted: true,
            createdAt: now,
            updatedAt: now
          })
        }
      )

      await txn.public.pledgeOptions.updateOne(
        { id: potPledgeOptionId },
        {
          amount: amount + surplusAmountOfDonatedMemberships,
          updatedAt: now
        }
      )

      await txn.query(`
        UPDATE
          pledges
        SET
          total = (
            SELECT
              sum(amount * price)
            FROM
              "pledgeOptions"
            WHERE
              "pledgeId" = :potPledgeId
          )
        WHERE
          id = :potPledgeId
      `, {
        potPledgeId: potPledge.id
      })
    }

    await txn.transactionCommit()
  } catch (e) {
    await txn.transactionRollback()
    throw e
  }
}

module.exports = {
  generateMemberships
}
