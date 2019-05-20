const { dsvFormat } = require('d3-dsv')

const { timeFormat, formatPrice } = require('@orbiting/backend-modules-formats')
const { Roles } = require('@orbiting/backend-modules-auth')

const csvFormat = dsvFormat(';').format
const dateTimeFormat = timeFormat('%x %H:%M') // %x - the locale’s date

const aggregatePackageOptions = (options) => {
  const amount = options.reduce((acc, { amount, periods }) => {
    return periods ? acc + (amount * periods) : acc + amount
  }, 0)
  const price = options.reduce((acc, { price }) => acc + price, 0)
  return { amount, price }
}

const convertPackage = (name, pledgeOptions, fallbackPrice) => {
  const resultPairs = {}
  const { amount, price } = aggregatePackageOptions(pledgeOptions)
  resultPairs[`${name} #`] = amount
  resultPairs[`${name} wert`] = formatPrice(price || fallbackPrice)
  resultPairs[`${name} total`] = formatPrice(price * amount)
  return resultPairs
}

const filterPackageOptionsByRewardName = (packageOptions, rewardName) =>
  packageOptions
    .filter(packageOption =>
      (packageOption.reward && packageOption.reward.name === rewardName))

const filterPledgeOptions = (pledgeOptions, packageOptions) =>
  pledgeOptions
    .filter(pledgeOption =>
      !!packageOptions.find(packageOption => packageOption.id === pledgeOption.templateId))

module.exports = async (_, args, {pgdb, user}) => {
  Roles.ensureUserHasRole(user, 'accountant')

  let { paymentIds, companyName } = args
  let packageIds
  if (!paymentIds) {
    paymentIds = await pgdb.queryOneColumn(`SELECT id FROM payments`)
  }

  try {
    packageIds = await pgdb.queryOneColumn(`
      SELECT pkg.id
      FROM packages pkg
      INNER JOIN
        companies c
        ON pkg."companyId" = c.id
      WHERE c.name = :companyName
    `, { companyName })
  } catch (e) {
    console.warn(e)
    throw new Error('You need to provide a companyName that exists in order to get an export')
  }

  const goodies = await pgdb.public.goodies.findAll()
  const membershipTypes = await pgdb.public.membershipTypes.findAll()
  const rewards = (await pgdb.public.rewards.findAll()).map(reward => {
    const goodie = goodies.find(g => g.rewardId === reward.id)
    const membershipType = membershipTypes.find(m => m.rewardId === reward.id)
    if (goodie) {
      return Object.assign({}, reward, {
        goodie,
        name: goodie.name
      })
    } else {
      return Object.assign({}, reward, {
        membershipType,
        name: membershipType.name
      })
    }
  })
  const pkgOptions = (await pgdb.public.packageOptions.findAll()).map(pkgOption =>
    Object.assign({}, pkgOption, {
      reward: rewards.find(r => r.id === pkgOption.rewardId)
    })
  )
  const donationPackageOptions = pkgOptions.filter(pkgo => !pkgo.reward)

  const aboPackageOptions = filterPackageOptionsByRewardName(pkgOptions, 'ABO')
  const benefactorPackageOptions = filterPackageOptionsByRewardName(pkgOptions, 'BENEFACTOR_ABO')
  const aboGiveMonthsPackageOptions = filterPackageOptionsByRewardName(pkgOptions, 'ABO_GIVE_MONTHS')
  const notebookPackageOptions = filterPackageOptionsByRewardName(pkgOptions, 'NOTEBOOK')
  const totebagPackageOptions = filterPackageOptionsByRewardName(pkgOptions, 'TOTEBAG')

  const payments = (await pgdb.query(`
    SELECT
      pay.id AS "paymentId",
      p.id AS "pledgeId",
      u.id AS "userId",
      u.email AS "email",
      u."firstName" AS "firstName",
      u."lastName" AS "lastName",
      p.status AS "pledgeStatus",
      p."createdAt" AS "pledgeCreatedAt",
      pay.method AS "paymentMethod",
      pay.status AS "paymentStatus",
      p.donation AS "donation",
      p.total AS "pledgeTotal",
      pay.total AS "paymentTotal",
      pay."updatedAt" AS "paymentUpdatedAt",
      array_to_json(array_agg(po)) AS "pledgeOptions"
    FROM
      payments pay
    JOIN
      "pledgePayments" pp
      ON pay.id = pp."paymentId"
    JOIN
      pledges p
      ON pp."pledgeId" = p.id
    JOIN
      "pledgeOptions" po
      ON p.id = po."pledgeId"
    JOIN
      users u
      ON p."userId" = u.id
    WHERE
      ARRAY[pay.id] && :paymentIds AND
      ARRAY[p."packageId"] && :packageIds
    GROUP BY
      pay.id, p.id, u.id
    ORDER BY
      u.email
  `, {
    paymentIds,
    packageIds
  })).map(result => {
    const { pledgeOptions } = result

    // the only way to determine if the abo was reduced
    // is to check if pledge.donation is < 0
    // If that's the case, it's the only product
    // bought in that pledge.

    const abos = filterPledgeOptions(pledgeOptions, aboPackageOptions)
    const regularAbos = result.donation >= 0 ? abos : []
    const reducedAbos = result.donation < 0 ? abos : []
    const benefactorAbos = filterPledgeOptions(pledgeOptions, benefactorPackageOptions)
    const aboGiveMonthsAbos = filterPledgeOptions(pledgeOptions, aboGiveMonthsPackageOptions)
    const notebooks = filterPledgeOptions(pledgeOptions, notebookPackageOptions)
    const totebags = filterPledgeOptions(pledgeOptions, totebagPackageOptions)

    // if price changed during crowdfundings
    // this is going to fuck up the "wert" column for old entries
    const aboDefaultPrice = aboPackageOptions[0].price
    const benefactorDefaultPrice = benefactorPackageOptions[0].price
    const aboGiveMonthsDefaultPrice = aboGiveMonthsPackageOptions[0].price
    const notebookDefaultPrice = notebookPackageOptions[0].price
    const totebagDefaultPrice = totebagPackageOptions[0].price

    const donations = pledgeOptions.filter(plo =>
      !!donationPackageOptions.find(pko => pko.id === plo.templateId)
    )
    const numDonations = donations.reduce((sum, d) => sum + d.amount, 0)
    const donation = numDonations > 0
      ? result.donation + 100 // minPrice of donation is 1
      : result.donation

    return {
      paymentId: result.paymentId.substring(0, 13),
      pledgeId: result.pledgeId.substring(0, 13),
      userId: result.userId.substring(0, 13),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      pledgeStatus: result.pledgeStatus,
      pledgeCreatedAt: dateTimeFormat(result.pledgeCreatedAt),
      pledgeTotal: formatPrice(result.pledgeTotal),
      paymentMethod: result.paymentMethod,
      paymentStatus: result.paymentStatus,
      paymentTotal: formatPrice(result.paymentTotal),
      paymentUpdatedAt: dateTimeFormat(result.paymentUpdatedAt),
      ...(convertPackage('ABO', regularAbos, aboDefaultPrice)),
      ...(convertPackage('ABO_REDUCED', reducedAbos, aboDefaultPrice)),
      ...(convertPackage('ABO_BENEFACTOR', benefactorAbos, benefactorDefaultPrice)),
      ...(convertPackage('ABO_GIVE_MONTHS', aboGiveMonthsAbos, aboGiveMonthsDefaultPrice)),
      ...(convertPackage('NOTEBOOK', notebooks, notebookDefaultPrice)),
      ...(convertPackage('TOTEBAG', totebags, totebagDefaultPrice)),
      'DONATION #': numDonations,
      // 'DONATION total': formatPrice(donations.reduce((sum, d) => sum + d.price, 0)),
      donation: formatPrice(donation)
    }
  })

  const paymentsEnhancedWithSimulatedSuccessfulPaymentEntries = payments
    .reduce((result, payment) => {
      if (payment.pledgeStatus === 'CANCELLED') {
        // build and concat with result:
        // - simulated entry with status successful and set the booking date to the date when the payment was created
        // - original entry (cancelled) enhanced with a booking date set to the date the payment was last updated
        const simulatedSuccessfulPayment = {
          type: 'verkauf',
          simulatedBookingDate: payment.pledgeCreatedAt,
          ...payment,
          total: payment.paymentTotal
        }
        const enhancedOriginalPayment = {
          type: 'storno',
          simulatedBookingDate: payment.paymentUpdatedAt,
          ...payment,
          total: (parseFloat(payment.paymentTotal) * -1).toFixed(2)
        }

        return [ ...result, simulatedSuccessfulPayment, enhancedOriginalPayment ]
      }
      // build and concat with result:
      // - original entry (cancelled) enhanced with a booking date set to the date the payment was created
      const enhancedOriginalPayment = {
        type: 'verkauf',
        simulatedBookingDate: payment.pledgeCreatedAt,
        ...payment,
        total: payment.paymentTotal
      }
      return [ ...result, enhancedOriginalPayment ]
    }, [])

  return csvFormat(paymentsEnhancedWithSimulatedSuccessfulPaymentEntries)
}
