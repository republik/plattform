//
// This script copys the packages and packageOptions from PRESALE
// and adds the MONTHLY_MEMBERSHIP
//
// usage
// node seeds/launch/add_launch_data.js
//
require('@orbiting/backend-modules-env').config()
process.on('unhandledRejection', up => { throw up })
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

console.log('running add_launch_data.js...')
PgDb.connect().then(async (pgdb) => {
  if (await pgdb.public.crowdfundings.findFirst({name: 'LAUNCH'})) {
    throw new Error('LAUNCH crowdfunding already exists, aborting!')
  }

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()

    // update presale
    await transaction.public.crowdfundings.update({
      name: 'PRESALE'
    }, {
      endDate: '2018-01-14T07:00:00.000+01:00'
    })

    // insert lunch crowdfunding
    console.warn('LAUNCH crowdfunding begins NOW!')
    const launch = await transaction.public.crowdfundings.insertAndGet({
      name: 'LAUNCH',
      // beginDate: '2018-01-14T07:00:00.000+01:00',
      beginDate: now,
      endDate: '2019-01-15T12:00:00.000+01:00'
    })

    // copy packages from PRESALE
    const presale = await transaction.public.crowdfundings.findOne({ name: 'PRESALE' })
    const presalePackages = await transaction.public.packages.find({ crowdfundingId: presale.id })
    for (let presalePackage of presalePackages) {
      const presalePackageOptions = await transaction.public.packageOptions.find({
        packageId: presalePackage.id
      })
      delete presalePackage.id
      const launchPackage = await transaction.public.packages.insertAndGet({
        ...presalePackage,
        crowdfundingId: launch.id,
        createdAt: now,
        updatedAt: now
      })
      for (let presalePackageOption of presalePackageOptions) {
        delete presalePackageOption.id
        await transaction.public.packageOptions.insert({
          ...presalePackageOption,
          packageId: launchPackage.id,
          createdAt: now,
          updatedAt: now
        })
      }
    }

    // get republik company
    const republikCompany = await transaction.public.companies.findOne({
      name: 'REPUBLIK'
    })

    // insert monthly membership
    const monthlyMembershipReward = await transaction.public.rewards.insertAndGet({
      type: 'MembershipType'
    })

    await transaction.public.membershipTypes.insertAndGet({
      rewardId: monthlyMembershipReward.id,
      rewardType: 'MembershipType',
      name: 'MONTHLY_ABO',
      interval: 'month',
      defaultPeriods: 1,
      price: 2200,
      companyId: republikCompany.id
    })

    const monthlyMembershipPackage = await transaction.public.packages.insertAndGet({
      name: 'MONTHLY_ABO',
      crowdfundingId: launch.id,
      companyId: republikCompany.id,
      paymentMethods: ['STRIPE']
    })

    await transaction.public.packageOptions.insert({
      packageId: monthlyMembershipPackage.id,
      rewardId: monthlyMembershipReward.id,
      minAmount: 1,
      maxAmount: 1,
      defaultAmount: 1,
      price: 2200,
      userPrice: false
    })

    console.log('finished.')
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
