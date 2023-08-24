#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const archiveUnsubscribedOnboarding = require('../../lib/scheduler/archiveUnsubscribedOnboarding')

const argv = yargs.option('dry-run', {
  default: true,
}).argv

const dryRun = argv['dry-run']

archiveUnsubscribedOnboarding(dryRun).catch((e) => {
  console.error(e)
})
