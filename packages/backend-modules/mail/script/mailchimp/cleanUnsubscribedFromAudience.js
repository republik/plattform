#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const onboarding = require('../../lib/scheduler/onboarding')

const argv = yargs.option('dry-run', {
  default: true,
}).argv

onboarding(argv['dry-run']).catch((e) => {
  console.error(e)
})
