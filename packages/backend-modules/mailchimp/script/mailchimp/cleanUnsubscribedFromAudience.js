#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const { archiveUnsubscribed } = require('../../build/lib/scheduler/archiveUnsubscribed')

const argv = yargs.option('dry-run', {
  default: true,
}).argv

const dryRun = argv['dry-run']

archiveUnsubscribed(dryRun).catch((e) => {
  console.error(e)
})
