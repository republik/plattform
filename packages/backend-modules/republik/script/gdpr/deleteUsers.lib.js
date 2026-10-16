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

// Bucket and path of a portrait url (".../s3/<bucket>/<path>?..."), or null.
const portraitKey = (portraitUrl) => {
  try {
    const parts = new URL(portraitUrl).pathname.replace(/^\//, '').split('/')
    if (parts[0] !== 's3' || parts.length < 3) {
      return null
    }
    return {
      bucket: parts[1],
      path: decodeURIComponent(parts.slice(2).join('/')),
    }
  } catch (e) {
    return null
  }
}

// True if a user other than `excludeUserId` points at the same S3 file (the
// file name is a hash of the image, so users can share a file). Compares
// bucket and path, not the host. `db` is a pgdb or a transaction.
const isPortraitShared = async (db, portraitUrl, excludeUserId = null) => {
  const key = portraitKey(portraitUrl)
  if (!key) {
    return false
  }
  const escape = (value) => value.replace(/[\\%_]/g, '\\$&')
  const { count } = await db.queryOne(
    `SELECT count(*)::int AS count FROM users
     WHERE "portraitUrl" LIKE :pattern
       ${excludeUserId ? 'AND id <> :excludeUserId' : ''}`,
    {
      pattern: `%/s3/${escape(key.bucket)}/${escape(key.path)}%`,
      ...(excludeUserId ? { excludeUserId } : {}),
    },
  )
  return count > 0
}

// Portraits are public S3 objects (portraits/<md5>.jpeg). Returns true on
// success. A portrait in another bucket than this app's (e.g. production
// images referenced by a copied staging database) is NOT deleted: that is only
// a warning, retrying would not help.
const deletePortrait = async (portraitUrl, ctx) => {
  const key = portraitKey(portraitUrl)
  if (!key) {
    emit('warning', { ...ctx, message: 'portrait url not recognised, kept' })
    return true
  }
  if (key.bucket !== process.env.AWS_S3_BUCKET) {
    emit('warning', {
      ...ctx,
      message: `portrait not deleted: bucket ${key.bucket} is not this app's bucket`,
    })
    return true
  }
  try {
    const S3 = require('@orbiting/backend-modules-assets/lib/s3')
    if (await S3.del({ bucket: key.bucket, path: key.path })) {
      return true
    }
    throw new Error('S3 deleteObject failed')
  } catch (e) {
    emit('external_failure', {
      kind: 'portrait',
      ...ctx,
      portraitUrl,
      error: e.message,
    })
    return false
  }
}

// false if the deployed mailchimp package was built without deleteEmailDetailed
// (stale build): every Mailchimp deletion would then fail after the commit
const mailchimpDeleteAvailable = typeof deleteEmailDetailed === 'function'

module.exports = {
  emit,
  readStdin,
  isLocalDatabase,
  getDbHost,
  getStripeClients,
  deleteStripeCustomer,
  deleteFromMailchimp,
  deletePortrait,
  portraitKey,
  isPortraitShared,
  mailchimpDeleteAvailable,
}
