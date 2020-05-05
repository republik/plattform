#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

/**
 * Script to check status of a MailChimp batch with a batch ID.
 *
 * $ checkBatch.js --id {batch ID}
 *
 */
const yargs = require('yargs')

const MailchimpInterface = require('../../MailchimpInterface')

const mailchimp = MailchimpInterface({ logger: console })

const argv = yargs
  .option('id', { required: true })
  .argv

mailchimp
  .getBatch(argv.id)
  .then(r => r.json())
  .then(r => { console.log('status', r) })
