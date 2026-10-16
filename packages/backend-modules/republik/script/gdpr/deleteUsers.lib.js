/**
 * Shared by deleteUsers.js and retryExternalDeletions.js: the NDJSON logger,
 * stdin / database helpers and the deletions in Stripe and Mailchimp.
 * Importing this file has no side effects.
 */
const fs = require('fs')
const crypto = require('crypto')
const { deleteEmailDetailed } = require('@orbiting/backend-modules-mailchimp')
const getStripeClients = require('@orbiting/backend-modules-republik-crowdfundings/lib/payments/stripe/clients')

const runId = crypto.randomUUID()
const emit = (event, data = {}) =>
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), runId, event, ...data }),
  )

const readStdin = () => {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch (e) {
    throw new Error(`could not read stdin: ${e.message}`)
  }
}

const isLocalDatabase = () => {
  try {
    const { hostname } = new URL(process.env.DATABASE_URL)
    return ['localhost', '127.0.0.1', '::1', '[::1]', ''].includes(hostname)
  } catch (e) {
    return false
  }
}

const getDbHost = () => {
  try {
    return new URL(process.env.DATABASE_URL).hostname
  } catch (e) {
    return null
  }
}

// returns true on success (a customer that is already gone counts)
const deleteStripeCustomer = async (accounts, customer, ctx) => {
  const account = accounts.find((a) => a.company.id === customer.companyId)
  if (!account) {
    emit('external_failure', {
      kind: 'stripe',
      ...ctx,
      customerId: customer.id,
      companyId: customer.companyId,
      error: 'no stripe account configured for company',
    })
    return false
  }
  try {
    await account.stripe.customers.del(customer.id)
    return true
  } catch (e) {
    if (e && e.code === 'resource_missing') {
      return true
    }
    emit('external_failure', {
      kind: 'stripe',
      ...ctx,
      customerId: customer.id,
      companyId: customer.companyId,
      error: e.message,
    })
    return false
  }
}

// returns true on success. "Not a member of this audience" (HTTP 404) is the
// normal answer for most audiences and counts as done; any other failure
// (rate limit, server error, bad key) is a failure that has to be retried.
const deleteFromMailchimp = async (email, ctx) => {
  try {
    const results = await deleteEmailDetailed({ email })
    const failed = results.filter((r) => !r.ok && !r.notMember)
    if (failed.length) {
      emit('external_failure', {
        kind: 'mailchimp',
        ...ctx,
        email,
        error: failed
          .map((r) => `audience ${r.audienceId}: HTTP ${r.status}`)
          .join(', '),
      })
      return false
    }
    return true
  } catch (e) {
    emit('external_failure', {
      kind: 'mailchimp',
      ...ctx,
      email,
      error: e.message,
    })
    return false
  }
}

module.exports = {
  emit,
  readStdin,
  isLocalDatabase,
  getDbHost,
  getStripeClients,
  deleteStripeCustomer,
  deleteFromMailchimp,
}
