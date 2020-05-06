#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

/**
 * Script to run MailChimp batch operations (check lib/operations) and
 * return batch status every {interval} until finished:
 *
 * $ runOperations.js --type {operations type} --interval 10
 *
 * Set no interval to skip batch status check:
 *
 * $ runOperations.js --type {operations type} --no-interval
 *
 */
const Promise = require('bluebird')
const yargs = require('yargs')

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const MailchimpInterface = require('../../MailchimpInterface')
const { operations: operationsFns } = require('../../lib')

const mailchimp = MailchimpInterface({ logger: console })

const argv = yargs
  .option('type', {
    description: 'type of operations to run',
    required: true,
    choices: Object.keys(operationsFns)
  })
  .option('interval', {
    description: 'status interval (in seconds)',
    default: 4
  })
  .option('dry-run', {
    default: true
  })
  .argv

Promise.props({ pgdb: PgDb.connect() }).then(async connections => {
  const context = { ...connections }

  const operations = await operationsFns[argv.type](context)

  if (!operations.length) {
    console.warn(`type of operations "${argv.type}" yielded in no operations`)
    return connections
  }

  console.log({ type: argv.type, operations: operations.length })

  if (argv.dryRun) {
    console.warn('WARNING: In dry-run-mode, not posting operations to MailChimp. Disable with --no-dry-run')
    return connections
  }

  await mailchimp
    .postBatch(operations)
    .then(r => r.json())
    .then(async batch => {
      const { id } = batch

      if (argv.interval) {
        let isRunning = false

        do {
          const {
            status,
            submitted_at: submittedAt,
            total_operations: totalOperations,
            finished_operations: finishedOperations
          } = await mailchimp.getBatch(id).then(r => r.json())

          console.log(
            'status',
            { batch: id, status, submittedAt, totalOperations, finishedOperations }
          )

          isRunning = status !== 'finished'

          if (isRunning) {
            await Promise.delay(1000 * argv.interval)
          }
        } while (isRunning)
      } else { // if (argv.interval) {
        const {
          status,
          submitted_at: submittedAt,
          total_operations: totalOperations
        } = batch

        console.log(
          'status',
          { batch: id, status, submittedAt, totalOperations }
        )
      }
    })

  return connections
})
  .then(async connections => {
    const { pgdb } = connections

    await pgdb.close()
  })
  .catch(e => { console.error(e) })
