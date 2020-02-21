#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()
const Promise = require('bluebird')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

Promise.props({
  pgdb: PgDb.connect()
}).then(async (connections) => {
  const { pgdb } = connections

  if (await pgdb.public.packages.findOne({ name: 'DONATE_POT' })) {
    throw new Error('package DONATE_POT already exists, aborting!')
  }

  const txn = await pgdb.transactionBegin()
  try {
    const now = new Date()

    const crowdfunding = await txn.public.crowdfundings.findOne({
      name: 'LAUNCH'
    })
    const company = await txn.public.companies.findOne({
      name: 'PROJECT_R'
    })

    const givePkg = await txn.public.packages.findOne({
      name: 'ABO_GIVE',
      crowdfundingId: crowdfunding.id,
      companyId: company.id
    })

    const membershipRewardIds = await txn.public.rewards.find({
      type: 'MembershipType'
    })
      .then(rows => rows.map(r => r.id))

    // enable accessGranted for ABO_GIVE
    const existingPkgOption = await txn.public.packageOptions.updateAndGetOne(
      {
        packageId: givePkg.id,
        rewardId: membershipRewardIds,
        accessGranted: false
      },
      {
        minAmount: 0
      }
    )
    delete existingPkgOption.id
    await txn.public.packageOptions.insert({
      ...existingPkgOption,
      accessGranted: true,
      createdAt: now,
      updatedAt: now
    })

    // insert DONATE_POT
    const donatePkg = await txn.public.packages.insertAndGet({
      name: 'DONATE_POT',
      crowdfundingId: crowdfunding.id,
      companyId: company.id,
      paymentMethods: ['STRIPE', 'POSTFINANCECARD', 'PAYPAL', 'PAYMENTSLIP'],
      order: 550,
      group: 'GIVE',
      createdAt: now,
      updatedAt: now
    })

    await txn.public.packageOptions.insert({
      packageId: donatePkg.id,
      rewardId: null,
      minAmount: 1,
      maxAmount: 1,
      defaultAmount: 1,
      price: 0,
      userPrice: true,
      minUserPrice: 0,
      vat: 0,
      order: 100,
      disabled: false,
      hiddenAt: null,
      disabledAt: null,
      accessGranted: false
    })

    console.log('finished.')
    await txn.transactionCommit()
  } catch (e) {
    await txn.transactionRollback()
    throw e
  }
  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
