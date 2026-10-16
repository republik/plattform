/**
 * Batch version of the `deleteUser` mutation (republik-crowdfundings).
 *
 * Takes e-mails and/or user ids (uuid) as arguments or via stdin (separated by
 * whitespace, commas or semicolons, lines starting with # are ignored).
 *
 * Differences to the mutation:
 * - one transaction per user, a failing user does not affect the others
 * - external systems (Stripe, Mailchimp) are only touched AFTER the DB
 *   transaction committed successfully
 * - comments are unpublished by default
 * - no names / e-mails are sent to Slack, only a summary with row counts
 * - kept users (bookkeeping) lose first name, last name and address, too
 * - addresses are deleted if nothing references them anymore; if only
 *   bookkeeping rows (e.g. pledges) still do, the name is cleared
 * - membership / subscription cancellation reasons and mail logs are deleted
 * - once everything is deleted, the user gets a confirmation mail
 *   (template mail/templates/data_deletion_confirmation.html). It is not sent
 *   if the Stripe / Mailchimp deletion failed. retryExternalDeletions.js never
 *   sends mails, it only reports who is still waiting for one.
 *
 * DRY RUN IS THE DEFAULT: everything is rolled back and nothing external
 * is called. Pass --no-dry-run to actually delete. --no-dry-run is refused
 * for non-local DATABASE_URL hosts unless --allow-remote is passed as well.
 *
 * Output: one JSON object per line on stdout (NDJSON), so it can be piped or
 * redirected to a file and filtered with e.g. `jq`. Every line has `ts` and
 * `event`. Failed Stripe / Mailchimp deletions are logged as
 * `external_failure` events and can be retried with retryExternalDeletions.js.
 *
 * Usage:
 *   node script/gdpr/deleteUsers.js a@example.org <uuid> ...
 *   cat list.txt | node script/gdpr/deleteUsers.js
 *   cat list.txt | node script/gdpr/deleteUsers.js --no-dry-run > run.log

 * Failed Stripe / Mailchimp deletions are retried with
 * script/gdpr/retryExternalDeletions.js, which reads the log of a run.
 *
 * Flags:
 *   --no-dry-run      actually delete (default: dry run)
 *   --allow-remote    allow --no-dry-run against a non-local database
 *   --keep-comments   do not unpublish comments (they are detached either way)
 *   --no-slack        do not post the summary to Slack
 */
require('@orbiting/backend-modules-env').config()
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')
const { publish } = require('@orbiting/backend-modules-slack')
const {
  emit,
  readStdin,
  isLocalDatabase,
  getDbHost,
  getStripeClients,
  deleteStripeCustomer,
  deleteFromMailchimp,
  deletePortrait,
} = require('./deleteUsers.lib')

const argv = yargs(hideBin(process.argv))
  .parserConfiguration({ 'parse-numbers': false })
  .option('dry-run', {
    description: 'Run script in dry-mode, disable with --no-dry-run',
    type: 'boolean',
    default: true,
  })
  .option('allow-remote', {
    description: 'Allow --no-dry-run against a non-local database',
    type: 'boolean',
    default: false,
  })
  .option('keep-comments', {
    description: 'Do not unpublish comments',
    type: 'boolean',
    default: false,
  })
  .option('slack', {
    description: 'Post summary to Slack, disable with --no-slack',
    type: 'boolean',
    default: true,
  })
  .parseSync()

const dryRun = argv['dry-run']
const unpublishComments = !argv['keep-comments']
const postToSlack = argv.slack

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// columns on users that survive anonymisation
const KEEP_USER_COLUMNS = ['createdAt', 'updatedAt', 'deletedAt']

// relations to users that are kept, see deleteUser mutation
const KEEP_RELATIONS = [
  'public.accessGrants',
  'public.electionCandidacies',
  'public.pledges',
  'payments.invoices',
  'payments.orders',
  'public.stripeCustomers',
  'payments.stripeCustomers',
  'public.comments', // detached, see below
]

// Progress / timing. `phase(name)` marks what the script is working on, so we
// can report slow steps and print a heartbeat while one statement runs long.
const progress = { index: 0, total: 0, phase: null, since: 0, timings: {} }
const phase = (name) => {
  const now = Date.now()
  if (progress.phase) {
    progress.timings[progress.phase] =
      (progress.timings[progress.phase] || 0) + now - progress.since
  }
  progress.phase = name
  progress.since = now
}
const startUser = (index, total) => {
  Object.assign(progress, { index, total, timings: {}, phase: null })
  progress.startedAt = Date.now()
  phase('lookup')
}
// returns { durationMs, slowPhases } and stops the clock
const endUser = () => {
  phase(null)
  const slowPhases = Object.entries(progress.timings)
    .filter(([, ms]) => ms >= 500)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, ms]) => ({ phase: name, ms }))
  return { durationMs: Date.now() - progress.startedAt, slowPhases }
}
const HEARTBEAT_MS = 5000
const startHeartbeat = () =>
  setInterval(() => {
    if (progress.phase && Date.now() - progress.since >= HEARTBEAT_MS) {
      emit('progress', {
        index: progress.index,
        total: progress.total,
        userId: progress.userId,
        phase: progress.phase,
        seconds: Math.round((Date.now() - progress.since) / 1000),
      })
    }
  }, HEARTBEAT_MS).unref()

const readInput = () => {
  const positional = argv._.map(String).filter((a) => a !== '-')
  const useStdin =
    argv._.includes('-') || (!positional.length && !process.stdin.isTTY)
  const chunks = [...positional]
  if (useStdin) {
    chunks.push(readStdin())
  }
  const tokens = chunks
    .join('\n')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  return [
    ...new Set(tokens.map((t) => (UUID_RE.test(t) ? t.toLowerCase() : t))),
  ]
}

const quote = (id) => `"${String(id).replace(/"/g, '""')}"`

// all columns (schema, table, column) with a foreign key to <targetTable>
const getReferences = (tx, targetTable) =>
  tx.query(
    `
    SELECT
      R.TABLE_SCHEMA AS schema,
      R.TABLE_NAME AS table,
      R.column_name AS column
    FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE u
    INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS FK
      ON U.CONSTRAINT_CATALOG = FK.UNIQUE_CONSTRAINT_CATALOG
      AND U.CONSTRAINT_SCHEMA = FK.UNIQUE_CONSTRAINT_SCHEMA
      AND U.CONSTRAINT_NAME = FK.UNIQUE_CONSTRAINT_NAME
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE R
      ON R.CONSTRAINT_CATALOG = FK.CONSTRAINT_CATALOG
      AND R.CONSTRAINT_SCHEMA = FK.CONSTRAINT_SCHEMA
      AND R.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
    WHERE U.TABLE_NAME = :targetTable
  `,
    { targetTable },
  )

// runs a DELETE / UPDATE and returns the number of affected rows
const countAffected = async (tx, sql, params) => {
  const row = await tx.queryOne(
    `WITH d AS (${sql} RETURNING 1) SELECT count(*)::int AS count FROM d`,
    params,
  )
  return row.count
}

// Not every environment has every table (e.g. staging lacks some). A failing
// statement would abort the whole transaction, so check up front. `name` is
// schema-qualified and quoted where needed, e.g. 'public."leadTracking"'.
const existingTables = new Map()
const tableExists = async (tx, name) => {
  if (!existingTables.has(name)) {
    const { exists } = await tx.queryOne(
      `SELECT to_regclass(:name) IS NOT NULL AS exists`,
      { name },
    )
    existingTables.set(name, exists)
    if (!exists) {
      emit('warning', { message: `table ${name} does not exist, skipping it` })
    }
  }
  return existingTables.get(name)
}

const getNulledColumns = async (tx) => {
  const columns = await tx.queryOneColumn(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND is_nullable = 'YES'
  `,
  )
  return columns
    .filter((c) => !KEEP_USER_COLUMNS.includes(c))
    .reduce((acc, c) => ({ ...acc, [c]: null }), {})
}

const findUser = async (tx, token) => {
  if (UUID_RE.test(token)) {
    return tx.public.users.findOne({ id: token })
  }
  const users = await tx.query(
    `SELECT * FROM users WHERE lower(email) = lower(:email)`,
    { email: token },
  )
  if (users.length > 1) {
    throw new Error(`ambiguous: ${users.length} users share this e-mail`)
  }
  return users[0]
}

/**
 * Tables with a foreign key to users that are not kept, ordered so that
 * tables referenced by NO ACTION / RESTRICT foreign keys of other tables in
 * the list come last (e.g. notifications before mailLog, discussionPreferences
 * before credentials).
 */
const getDeletableRelations = async (tx, keep) => {
  const relations = (await getReferences(tx, 'users')).filter(
    (rel) => !keep.includes(`${rel.schema}.${rel.table}`),
  )
  const edges = await tx.query(`
    SELECT
      cn.nspname || '.' || cc.relname AS child,
      pn.nspname || '.' || pc.relname AS parent
    FROM pg_constraint c
    JOIN pg_class cc ON cc.oid = c.conrelid
    JOIN pg_namespace cn ON cn.oid = cc.relnamespace
    JOIN pg_class pc ON pc.oid = c.confrelid
    JOIN pg_namespace pn ON pn.oid = pc.relnamespace
    WHERE c.contype = 'f' AND c.confdeltype IN ('a', 'r') AND c.conrelid <> c.confrelid
  `)
  const name = (r) => `${r.schema}.${r.table}`
  const remaining = [...relations]
  const sorted = []
  while (remaining.length) {
    const next = remaining.findIndex(
      (r) =>
        !remaining.some((o) =>
          edges.some((e) => e.child === name(o) && e.parent === name(r)),
        ),
    )
    // cycle: fall back to the order we got
    sorted.push(...remaining.splice(next === -1 ? 0 : next, 1))
  }
  return sorted
}

/**
 * Deletes related data in the DB. Returns row counts by label.
 */
const deleteRelatedData = async (tx, userId, keep, unpublish, relations) => {
  const counts = {}

  phase('sessions, votes, comments')
  counts.sessions = await countAffected(
    tx,
    `DELETE FROM sessions s WHERE (s.sess #>> '{passport, user}')::uuid = :userId`,
    { userId },
  )

  // pull user from comments.votes, leaving upVotes, downVotes untouched.
  // `@>` uses the GIN index comments_votes_idx (a ::text LIKE scans the table).
  await tx.query(
    `
    UPDATE comments
      SET votes = COALESCE(NULLIF(sub.votes,'[{}]'::jsonb), '[]'::jsonb)
      FROM (
        SELECT id, jsonb_agg(v) AS votes
        FROM   (SELECT id, votes FROM comments WHERE votes @> jsonb_build_array(jsonb_build_object('userId', CAST(:userId AS text)))) c,
               jsonb_array_elements(
                 CASE
                   WHEN jsonb_array_length(votes) = 1
                   THEN votes || '{}'::jsonb
                   ELSE votes
                 END
               ) AS v
        WHERE  v->>'userId' <> :userId OR v = '{}'
        GROUP  BY 1
      ) sub
    WHERE comments.id = sub.id
  `,
    { userId },
  )

  // detach (and optionally unpublish) comments, they are not deleted
  counts['public.comments (detached)'] = await tx.public.comments.update(
    { userId },
    {
      userId: null,
      ...(unpublish ? { published: false, content: null } : {}),
    },
  )

  // Cancellations reference memberships / subscriptions without ON DELETE
  // CASCADE, so they have to go before their parents. If the parent is kept
  // for bookkeeping, only the free text reason (may contain PII) is cleared.
  phase('cancellations')
  const cancellations = [
    {
      label: 'public.membershipCancellations',
      parentKept: keep.includes('public.memberships'),
      table: 'public."membershipCancellations"',
      fk: '"membershipId"',
      parents: 'public.memberships',
    },
    {
      label: 'payments.subscriptionCancellations',
      parentKept: keep.includes('payments.subscriptions'),
      table: 'payments."subscriptionCancellations"',
      fk: '"subscriptionId"',
      parents: 'payments.subscriptions',
    },
  ]
  for (const c of cancellations) {
    if (!(await tableExists(tx, c.table))) continue
    const where = `${c.fk} IN (SELECT id FROM ${c.parents} WHERE "userId" = :userId)`
    if (c.parentKept) {
      counts[`${c.label} (reason cleared)`] = await countAffected(
        tx,
        `UPDATE ${c.table} SET reason = NULL WHERE ${where} AND reason IS NOT NULL`,
        { userId },
      )
    } else {
      counts[c.label] = await countAffected(
        tx,
        `DELETE FROM ${c.table} WHERE ${where}`,
        { userId },
      )
    }
  }

  // upgrades reference subscriptions without ON DELETE CASCADE (user_id has
  // no foreign key at all)
  if (
    !keep.includes('payments.subscriptions') &&
    (await tableExists(tx, 'payments.subscription_upgrades'))
  ) {
    counts['payments.subscription_upgrades'] = await countAffected(
      tx,
      `DELETE FROM payments.subscription_upgrades
       WHERE user_id = :userId
         OR subscription_id IN (SELECT id FROM payments.subscriptions WHERE "userId" = :userId)`,
      { userId },
    )
  }

  // sequential on purpose: on error we want to stop at the first failure
  for (const rel of relations) {
    const key = `${rel.schema}.${rel.table}`
    phase(`delete ${key}`)
    counts[key] =
      (counts[key] || 0) +
      (await tx[rel.schema][rel.table].delete({ [rel.column]: userId }))
  }

  return counts
}

/**
 * Call after the user row was deleted or its addressId nulled.
 * - nothing references the address: delete it
 * - another user shares it: leave untouched
 * - only bookkeeping rows (e.g. pledges) reference it: clear the name
 */
const cleanUpAddress = async (tx, addressId) => {
  const refs = await getReferences(tx, 'addresses')
  const referencedBy = []
  for (const ref of refs) {
    const { count } = await tx.queryOne(
      `SELECT count(*)::int AS count FROM ${quote(ref.schema)}.${quote(
        ref.table,
      )} WHERE ${quote(ref.column)} = :addressId`,
      { addressId },
    )
    if (count > 0) {
      referencedBy.push(`${ref.schema}.${ref.table}`)
    }
  }
  if (!referencedBy.length) {
    await tx.public.addresses.deleteOne({ id: addressId })
    return { action: 'deleted', rows: { 'public.addresses': 1 } }
  }
  if (referencedBy.includes('public.users')) {
    return { action: 'kept_shared_with_other_user', referencedBy, rows: {} }
  }
  // name is NOT NULL
  await tx.public.addresses.updateOne(
    { id: addressId },
    { name: '', updatedAt: new Date() },
  )
  return {
    action: 'name_cleared',
    referencedBy,
    rows: { 'public.addresses (name cleared)': 1 },
  }
}

// Customers live in public.stripeCustomers (id, companyId) and in the newer
// payments.stripeCustomers (customerId, company = companies.name). Some exist
// in the latter only.
const getStripeCustomers = async (tx, userId) => {
  const customers = await tx.query(
    `
    SELECT id, "companyId" FROM public."stripeCustomers" WHERE "userId" = :userId
    UNION
    SELECT sc."customerId" AS id, c.id AS "companyId"
    FROM payments."stripeCustomers" sc
    LEFT JOIN companies c ON c.name = sc.company::text
    WHERE sc."userId" = :userId
  `,
    { userId },
  )
  // the same customer may come from both tables, one without a company
  const byId = new Map()
  for (const c of customers) {
    if (!byId.has(c.id) || (!byId.get(c.id).companyId && c.companyId)) {
      byId.set(c.id, c)
    }
  }
  return [...byId.values()]
}

/**
 * Everything that happens in the DB for one user. Throws on any problem,
 * the caller rolls back. External side effects are only returned (never
 * executed) so they can run after commit.
 */
const deleteInDb = async (tx, user) => {
  if (user.deletedAt) {
    return { skipped: 'already deleted (anonymised)' }
  }
  phase('checks')
  if (await hasUserActiveMembership(user, tx)) {
    return { skipped: 'active membership or subscription' }
  }
  const userId = user.id

  const hasPledges = (await tx.public.pledges.count({ userId })) > 0
  const hasInvoices = (await tx.payments.invoices.count({ userId })) > 0
  const hasOrders = (await tx.payments.orders.count({ userId })) > 0
  const hasGrants =
    (await tx.public.accessGrants.count({
      or: [{ granterUserId: userId }, { recipientUserId: userId }],
    })) > 0
  const hasCandidacies =
    (await tx.public.electionCandidacies.count({ userId })) > 0

  const { count: claimed } = await tx.queryOne(
    `
    SELECT count(DISTINCT m.id)::int AS count
    FROM memberships m
    JOIN pledges p ON m."pledgeId" = p.id
    WHERE m."userId" = :userId AND p."userId" <> :userId
  `,
    { userId },
  )
  const hasClaimedMemberships = claimed > 0

  const keep = [...KEEP_RELATIONS]
  if (hasPledges || hasClaimedMemberships) {
    keep.push('public.memberships')
  }
  if (hasInvoices || hasOrders) {
    keep.push('payments.subscriptions')
  }

  const mustKeepRow =
    hasPledges ||
    hasInvoices ||
    hasOrders ||
    hasGrants ||
    hasCandidacies ||
    hasClaimedMemberships

  phase('find related tables')
  const relations = await getDeletableRelations(tx, keep)

  // editorial users own publikator data (commits, milestones, ...) that is
  // referenced by other rows; not a case for a batch script
  for (const rel of relations.filter((r) => r.schema === 'publikator')) {
    if ((await tx[rel.schema][rel.table].count({ [rel.column]: userId })) > 0) {
      return { skipped: `has publikator data (${rel.table}), handle manually` }
    }
  }

  const stripeCustomers = await getStripeCustomers(tx, userId)

  // The portrait file on S3 is deleted after the commit, unless another user
  // points at the same file (the file name is a hash of the image).
  let portrait = { action: 'none' }
  if (user.portraitUrl) {
    const { count: sharedWith } = await tx.queryOne(
      `SELECT count(*)::int AS count FROM users
       WHERE id <> :userId AND "portraitUrl" LIKE :prefix`,
      {
        userId,
        prefix: `${user.portraitUrl.split('?')[0].replace(/[\\%_]/g, '\\$&')}%`,
      },
    )
    portrait = sharedWith
      ? { action: 'kept_shared_with_other_user' }
      : { action: 'delete', url: user.portraitUrl }
  }

  const rows = await deleteRelatedData(
    tx,
    userId,
    keep,
    unpublishComments,
    relations,
  )

  // Tables identified by e-mail only (no foreign key to users). mailLog rows
  // with userId are already covered by deleteRelatedData.
  const email = user.email
  const byEmail = [
    [
      'public.mailLog (by email)',
      'public."mailLog"',
      `DELETE FROM "mailLog" WHERE email = :email`,
    ],
    [
      'public.tokens',
      'public.tokens',
      `DELETE FROM tokens WHERE lower(email::text) = lower(:email)`,
    ],
    [
      'public.leadTracking',
      'public."leadTracking"',
      `DELETE FROM "leadTracking" WHERE email = :email`,
    ],
    [
      'public.mailchimpLog',
      'public."mailchimpLog"',
      `DELETE FROM "mailchimpLog" WHERE email = :email`,
    ],
    [
      'public.mailchimpLog (oldEmail cleared)',
      'public."mailchimpLog"',
      `UPDATE "mailchimpLog" SET "oldEmail" = NULL WHERE "oldEmail" = :email`,
    ],
    [
      'public.l_mc_audience_check',
      'public.l_mc_audience_check',
      `DELETE FROM l_mc_audience_check WHERE lower(email) = lower(:email)`,
    ],
    [
      // kept grants stay for bookkeeping, without the address
      'public.accessGrants (email cleared)',
      'public."accessGrants"',
      `UPDATE "accessGrants" SET email = NULL
       WHERE email IS NOT NULL AND ("recipientUserId" = :userId OR email = :email)`,
    ],
    [
      'payments.orders (customerEmail cleared)',
      'payments.orders',
      `UPDATE payments.orders SET "customerEmail" = NULL
       WHERE "userId" = :userId AND "customerEmail" IS NOT NULL`,
    ],
  ]
  for (const [label, table, sql] of byEmail) {
    phase(`by email: ${label}`)
    if (await tableExists(tx, table)) {
      rows[label] = await countAffected(tx, sql, { email, userId })
    }
  }

  phase('user row')
  if (!mustKeepRow) {
    // stripe customers are deleted remotely after commit; local rows have to
    // go now because they reference the user
    rows['payments.stripeCustomers'] = await tx.payments.stripeCustomers.delete(
      { userId },
    )
    rows['public.stripeCustomers'] = await tx.public.stripeCustomers.delete({
      userId,
    })
    rows['public.users'] = await tx.public.users.delete({ id: userId })
  } else {
    const nulledColumns = await getNulledColumns(tx)
    await tx.public.users.updateOne(
      { id: userId },
      {
        email: `${userId}_deleted@republik.ch`,
        hasPublicProfile: false,
        isListed: false,
        isAdminUnlisted: true,
        deletedAt: new Date(),
        ...nulledColumns, // includes firstName, lastName, addressId
      },
    )
    rows['public.users (anonymised)'] = 1

    // The Stripe customer is deleted at Stripe after the commit. Locally only
    // the reference (id, company, userId) stays for the bookkeeping rows; the
    // cached payment methods and other payload are removed.
    rows['public.stripeCustomers (cache cleared)'] = await countAffected(
      tx,
      `UPDATE public."stripeCustomers" SET cache = NULL, payload = NULL
       WHERE "userId" = :userId AND (cache IS NOT NULL OR payload IS NOT NULL)`,
      { userId },
    )
  }

  phase('address')
  let address = { action: 'none', rows: {} }
  if (user.addressId) {
    address = await cleanUpAddress(tx, user.addressId)
    Object.assign(rows, address.rows)
  }

  return {
    outcome: mustKeepRow ? 'anonymised' : 'deleted',
    rows,
    address: { action: address.action, referencedBy: address.referencedBy },
    email: user.email,
    stripeCustomers, // deleted at Stripe for deleted and anonymised users
    portrait,
  }
}

const CONFIRMATION_MAIL = {
  templateName: 'data_deletion_confirmation',
  subject: 'Bestätigung Datenlöschung',
  fromEmail: 'kontakt@republik.ch',
  fromName: 'Republik',
}

// Sent last, once everything is deleted. Uses an adapter that does not write
// to mailLog, so the address is not stored again. Returns true on success.
const sendConfirmationMail = async (email, ctx) => {
  const sendMailWithoutLog = require('@orbiting/backend-modules-mail/lib/sendMailWithoutLog')
  let failure
  try {
    const { status, error } = await sendMailWithoutLog({
      to: email,
      ...CONFIRMATION_MAIL,
    })
    if (!['SENT', 'SCHEDULED'].includes(status)) {
      failure = (error && error.message) || `mail status ${status}`
    }
  } catch (e) {
    failure = e.message
  }
  if (failure) {
    emit('external_failure', {
      kind: 'confirmation_mail',
      ...ctx,
      email,
      error: failure,
    })
    return false
  }
  return true
}

const sumRows = (rows) => Object.values(rows).reduce((a, b) => a + b, 0)

const postSlackSummary = async (text) => {
  if (dryRun || !postToSlack || !process.env.SLACK_CHANNEL_IT_MONITOR) {
    return
  }
  try {
    await publish(process.env.SLACK_CHANNEL_IT_MONITOR, text)
  } catch (e) {
    emit('warning', { message: `could not post to slack: ${e.message}` })
  }
}

async function main() {
  if (!dryRun && !isLocalDatabase() && !argv['allow-remote']) {
    emit('error', {
      message:
        'refusing to --no-dry-run against a non-local DATABASE_URL without --allow-remote',
    })
    return 2
  }

  const dbHost = getDbHost()

  const tokens = readInput()
  if (!tokens.length) {
    emit('error', {
      message: 'no e-mails or user ids given (arguments or stdin)',
    })
    return 2
  }
  emit('start', {
    mode: 'delete',
    dryRun,
    unpublishComments,
    inputs: tokens.length,
    dbHost,
  })

  const pgdb = await PgDb.connect()
  startHeartbeat()
  const stats = {
    deleted: 0,
    anonymised: 0,
    skipped: 0,
    notFound: 0,
    dbFailed: 0,
    addressesDeleted: 0,
    addressNamesCleared: 0,
    externalFailures: 0,
    confirmationMailsSent: 0,
    totalRows: 0,
  }
  const retryInputs = []
  let stripeAccounts

  const countFailures =
    (fn) =>
    async (...a) => {
      const ok = await fn(...a)
      if (!ok) stats.externalFailures++
      return ok
    }
  const deleteStripe = countFailures(deleteStripeCustomer)
  const deleteMailchimp = countFailures(deleteFromMailchimp)
  const deletePortraitCounted = countFailures(deletePortrait)

  for (const [i, token] of tokens.entries()) {
    const position = { index: i + 1, total: tokens.length }
    startUser(position.index, position.total)
    const tx = await pgdb.transactionBegin()
    let result
    let userId
    try {
      const user = await findUser(tx, token)
      if (!user) {
        await tx.transactionRollback()
        stats.notFound++
        emit('not_found', { ...position, input: token })
        continue
      }
      userId = user.id
      progress.userId = userId
      emit('user_start', { ...position, userId })
      result = await deleteInDb(tx, user)
      phase(dryRun || result.skipped ? 'rollback' : 'commit')
      if (result.skipped || dryRun) {
        await tx.transactionRollback()
      } else {
        await tx.transactionCommit()
      }
    } catch (e) {
      await tx.transactionRollback().catch(() => {})
      stats.dbFailed++
      retryInputs.push(token)
      emit('error', {
        ...position,
        input: token,
        userId,
        message: `rolled back: ${e.message}`,
      })
      continue
    }

    const { durationMs, slowPhases } = endUser()
    if (result.skipped) {
      stats.skipped++
      emit('skipped', { ...position, userId, reason: result.skipped })
      continue
    }

    const totalRows = sumRows(result.rows)
    stats[result.outcome]++
    stats.totalRows += totalRows
    if (result.address.action === 'deleted') stats.addressesDeleted++
    if (result.address.action === 'name_cleared') stats.addressNamesCleared++
    emit('user', {
      ...position,
      userId,
      outcome: result.outcome,
      committed: !dryRun,
      durationMs,
      slowPhases,
      totalRows,
      rows: result.rows,
      address: result.address,
      portrait: result.portrait.action,
    })

    if (dryRun) continue

    // DB is committed; now it is safe to touch Stripe and Mailchimp
    const ctx = { userId }
    const externalStartedAt = Date.now()
    phase('stripe')
    if (result.stripeCustomers.length) {
      try {
        stripeAccounts = stripeAccounts || (await getStripeClients(pgdb))
      } catch (e) {
        stripeAccounts = { accounts: [] }
        emit('warning', { message: `stripe clients: ${e.message}` })
      }
    }
    let allDeleted = true
    for (const customer of result.stripeCustomers) {
      const ok = await deleteStripe(
        stripeAccounts.accounts || [],
        customer,
        ctx,
      )
      allDeleted = allDeleted && ok
    }
    phase('mailchimp')
    allDeleted = (await deleteMailchimp(result.email, ctx)) && allDeleted
    if (result.portrait.action === 'delete') {
      phase('portrait')
      allDeleted =
        (await deletePortraitCounted(result.portrait.url, ctx)) && allDeleted
    }
    phase('confirmation mail')

    // confirmation only once everything is deleted, otherwise it is logged as
    // a failure; retryExternalDeletions.js does not send it, it only lists it
    if (allDeleted) {
      if (await sendConfirmationMail(result.email, ctx)) {
        stats.confirmationMailsSent++
      } else {
        stats.externalFailures++
      }
    } else {
      stats.externalFailures++
      emit('external_failure', {
        kind: 'confirmation_mail',
        ...ctx,
        email: result.email,
        error: 'not sent: Stripe/Mailchimp deletion failed',
      })
    }
    phase(null)
    emit('user_done', {
      ...position,
      userId,
      durationMs: durationMs + (Date.now() - externalStartedAt),
      externalMs: Date.now() - externalStartedAt,
      allDeleted,
    })
  }

  emit('summary', { ...stats, dryRun })
  if (retryInputs.length || stats.externalFailures) {
    emit('retry', {
      dbFailedInputs: retryInputs,
      externalFailures: stats.externalFailures,
      hint:
        'dbFailedInputs: rolled back, run again with these as input. ' +
        'external_failure events: store this log and pipe it into ' +
        '`retryExternalDeletions.js --no-dry-run`.',
    })
  }

  await postSlackSummary(
    `deleteUsers batch: ${stats.deleted} deleted, ${stats.anonymised} anonymised, ` +
      `${stats.skipped} skipped, ${stats.notFound} not found, ${stats.dbFailed} failed; ` +
      `${stats.totalRows} rows deleted, ${stats.addressesDeleted} addresses deleted, ` +
      `${stats.confirmationMailsSent} confirmation mails sent` +
      (stats.externalFailures
        ? `; ${stats.externalFailures} Stripe/Mailchimp/mail steps failed, see log`
        : ''),
  )

  await pgdb.close()
  return stats.dbFailed || stats.externalFailures ? 1 : 0
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    emit('error', { message: e.message, stack: e.stack })
    process.exit(1)
  })
