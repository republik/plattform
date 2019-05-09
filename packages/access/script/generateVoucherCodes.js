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
const debug = require('debug')('access:script:generateVoucherCodes')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

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

    if (argv.prefix && argv.prefix.match(/[^123456789ABCDEFGHKLMRSTUWXYZ]+/)) {
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
    const granter = await transaction.public.users.findOne({ id: argv.granter })

    if (!granter) {
      throw new Error('User not found.')
    }

    const grants = []

    let iteration = 0
    while (grants.length < argv.amount && iteration < 5 * argv.amount) {
      iteration++

      const grant = {
        voucherCode: await transaction.queryOneField(`SELECT make_hrid('"accessGrants"'::regclass, 'voucherCode'::text, ${grantsLib.VOUCHER_CODE_LENGTH}::bigint)`)
      }

      if (argv.prefix) {
        grant.voucherCode = argv.prefix + grant.voucherCode.slice(argv.prefix.length, grantsLib.VOUCHER_CODE_LENGTH)
      }

      // Push onto grants array if certain conditions are met:
      //   a) voucherCode is not in grants array already
      //   b) voucherCode is not to be found in accessGrants table
      if (
        // Check if voucherCode is in list already
        !grants.find(({ voucherCode }) => voucherCode === grant.voucherCode) &&
        // Check if voucherCode is already in accessGrants table
        (
          // Skip this check if argv.prefix is falsy as we can assume that make_hrid check for that
          // already.
          !argv.prefix ||
          (
            argv.prefix && // Lookup in database if argv.prefix is set
            await transaction.public.accessGrants.count({ voucherCode: grant.voucherCode }) === 0
          )
        )
      ) {
        grants.push(grant)
      }
    }

    debug({ grants })

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
