#!/usr/bin/env node
/**
 * This script can generated a desired amount of access grant voucher
 * codes for a single user.
 *
 * Usage:
 * packages/access/script/generateVoucherCodes.js --campaign <A Campaign ID> --granter <A User ID> --prefix ABC --amount 10
 */

require('@orbiting/backend-modules-env').config()
const yargs = require('yargs')

const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const grantsLib = require('../lib/grants')

const argv = yargs
  .option('campaign', { alias: ['c', 'ac', 'accessCampaignId'] })
  .option('granter', { alias: ['g', 'u', 'user'] })
  .option('amount', {
    alias: ['n'],
    type: 'number',
    default: 1
  })
  .option('prefix', { alias: ['p'] })
  .default(['campaign', 'granter', 'label'])
  .check(argv => {
    if (argv.prefix && argv.prefix.length >= grantsLib.VOUCHER_CODE_LENGTH) {
      return `Check --prefix. "${argv.prefix}" too long to generate voucher codes.`
    }

    if (argv.prefix.match(/[^123456789ABCDEFGHKLMRSTUWXYZ]+/)) {
      return `Check --prefix. "${argv.prefix}" contains invalid chars.`
    }

    if (argv.amount < 1) {
      return `Check --amount. Should be at least 1.`
    }

    return true
  })
  .help()
  .version()
  .argv

PgDb.connect().then(async pgdb => {
  const transaction = await pgdb.transactionBegin()

  try {
    const granter = await pgdb.public.users.findOne({ id: argv.granter })

    if (!granter) {
      throw new Error('User not found.')
    }

    const grants = []

    let iteration = 0
    while (grants.length < argv.amount && iteration < 5 * argv.amount) {
      iteration++

      const grant = {
        voucherCode: await pgdb.queryOneField(`SELECT make_hrid('"accessGrants"'::regclass, 'voucherCode'::text, ${grantsLib.VOUCHER_CODE_LENGTH}::bigint)`)
      }

      if (argv.prefix) {
        grant.voucherCode = argv.prefix + grant.voucherCode.slice(argv.prefix.length, grantsLib.VOUCHER_CODE_LENGTH)
      }

      if (
        await pgdb.public.accessGrants.count({ voucherCode: grant.voucherCode }) === 0 &&
        !grants.find(({ voucherCode }) => voucherCode === grant.voucherCode)
      ) {
        grants.push(grant)
      }
    }

    if (grants.length < argv.amount) {
      throw new Error(`Unable to generate ${argv.amount} unqiue voucher codes. Change parameters.`)
    }

    console.log(`inserting ${grants.length} grant(s)...`)

    await grantsLib.insert(granter, argv.campaign, grants, transaction)
    await transaction.transactionCommit()

    console.log(`${grants.length} grant(s) inserted.`)
  } catch (e) {
    await transaction.transactionRollback()
    console.error(e)
  } finally {
    await pgdb.close()
  }
}).then(() => console.log('Done.'))
