#!/usr/bin/env node
/**
 * Marks the Zendesk deletion-request tickets as solved once the batch deletion
 * (deleteUsers.js) has completed them, with a short internal note.
 *
 * ZENDESK CANNOT SET A TICKET TO "CLOSED": agents set "solved" and Zendesk
 * closes the ticket by itself afterwards (by default after 4 days, at the
 * latest after 28). So the default status is `solved`. `--status closed` tries
 * it anyway; Zendesk may refuse, and a closed ticket cannot be reopened.
 *
 * Inputs
 *   --tickets <file>   the tickets-<time>.json written by zendeskDeletionRequests.js
 *   stdin              the log(s) of the deleteUsers.js run(s), one JSON object
 *                      per line; several logs can be concatenated
 *
 * A ticket is only touched if its requester e-mail belongs to a user that was
 * COMPLETELY processed in the logs: committed as deleted or anonymised,
 * `user_done` with allDeleted (Stripe, Mailchimp, portrait and the confirmation
 * mail all worked) and no `external_failure` for that user. Everything else is
 * left open and listed with the reason (not in the logs, incomplete, already
 * solved, no requester e-mail). Users that needed a retry are NOT closed
 * automatically, because the retry never sends the confirmation mail.
 *
 * DRY RUN IS THE DEFAULT: it only lists what would be changed. Pass
 * --no-dry-run to update the tickets in Zendesk.
 *
 * Credentials (environment variables), like zendeskDeletionRequests.js:
 *   ZENDESK_SUBDOMAIN and either ZENDESK_OAUTH_TOKEN or
 *   ZENDESK_EMAIL + ZENDESK_API_TOKEN. The user needs the permission to update
 *   tickets (a light agent cannot change the status).
 *
 * Usage:
 *   cat run-1.log run-2.log | node script/gdpr/zendeskCloseProcessedRequests.js \
 *     --tickets ./zendesk-export/tickets-<time>.json
 *   ... --no-dry-run
 *
 * Output is NDJSON (one object per line) without e-mail addresses: ticket ids
 * and user ids only.
 */
require('@orbiting/backend-modules-env').config()
const fs = require('fs')
const crypto = require('crypto')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .option('tickets', {
    description: 'tickets-<time>.json from zendeskDeletionRequests.js',
    type: 'string',
  })
  .option('status', {
    description: 'status to set (Zendesk cannot set closed manually)',
    choices: ['solved', 'closed'],
    default: 'solved',
  })
  .option('note', {
    description: 'internal note added to each ticket, disable with --no-note',
    type: 'string',
    default: undefined,
  })
  .option('dry-run', {
    description: 'Only list what would be changed, disable with --no-dry-run',
    type: 'boolean',
    default: true,
  })
  .parseSync()

const dryRun = argv['dry-run']
const {
  ZENDESK_SUBDOMAIN,
  ZENDESK_EMAIL,
  ZENDESK_API_TOKEN,
  ZENDESK_OAUTH_TOKEN,
} = process.env

const runId = crypto.randomUUID()
const emit = (event, data = {}) =>
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), runId, event, ...data }),
  )

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const baseUrl = () => `https://${ZENDESK_SUBDOMAIN}.zendesk.com`
const authHeader = () =>
  ZENDESK_OAUTH_TOKEN
    ? `Bearer ${ZENDESK_OAUTH_TOKEN}`
    : 'Basic ' +
      Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString(
        'base64',
      )

// what happened to the users in the deletion logs, by user id
const parseLogs = (text) => {
  const users = new Map()
  const user = (id) => {
    if (!users.has(id)) {
      users.set(id, { failures: 0 })
    }
    return users.get(id)
  }
  for (const line of text.split('\n')) {
    let e
    try {
      e = JSON.parse(line)
    } catch (err) {
      continue
    }
    if (!e || !e.userId) continue
    if (e.event === 'pending_external' && e.email) {
      user(e.userId).email = String(e.email).trim().toLowerCase()
    } else if (e.event === 'user' && e.committed) {
      user(e.userId).outcome = e.outcome
    } else if (e.event === 'user_done') {
      Object.assign(user(e.userId), { done: true, allDeleted: e.allDeleted })
    } else if (e.event === 'external_failure') {
      user(e.userId).failures++
    }
  }
  return users
}

const isComplete = (u) =>
  !!(u.email && u.outcome && u.done && u.allDeleted === true && !u.failures)

const defaultNote = (outcome) =>
  `Löschanfrage durch das Batch-Löschskript erledigt am ${new Date()
    .toISOString()
    .slice(0, 10)}: Konto ${
    outcome === 'deleted' ? 'gelöscht' : 'anonymisiert'
  }, Stripe, Mailchimp und Profilbild bereinigt, Bestätigungsmail verschickt. (automatische Notiz)`

// PUT with retry on rate limit (429) and temporary server errors
const updateTicket = async (id, body) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(`${baseUrl()}/api/v2/tickets/${id}.json`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (response.ok) {
      return { ok: true, status: response.status }
    }
    const retryable = response.status === 429 || response.status >= 500
    if (retryable && attempt <= 5) {
      const wait =
        response.status === 429
          ? Number(response.headers.get('retry-after') || 10)
          : attempt * 2
      emit('waiting', { httpStatus: response.status, seconds: wait })
      await sleep(wait * 1000)
      continue
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Zendesk refused the credentials or the permission to update tickets (HTTP ${response.status}).`,
      )
    }
    let detail = ''
    try {
      detail = (await response.text()).slice(0, 300)
    } catch (e) {
      // ignore
    }
    return { ok: false, status: response.status, detail }
  }
}

const readStdin = () => {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch (e) {
    throw new Error(`could not read stdin: ${e.message}`)
  }
}

async function main() {
  if (!argv.tickets) {
    emit('error', { message: 'missing --tickets <tickets-time.json>' })
    return 2
  }
  const required = dryRun
    ? []
    : ZENDESK_OAUTH_TOKEN
    ? ['ZENDESK_SUBDOMAIN']
    : ['ZENDESK_SUBDOMAIN', 'ZENDESK_EMAIL', 'ZENDESK_API_TOKEN']
  const missing = required.filter((name) => !process.env[name])
  if (missing.length) {
    emit('error', {
      message: `missing environment variable(s): ${missing.join(', ')}`,
    })
    return 2
  }

  let tickets
  try {
    tickets = JSON.parse(fs.readFileSync(argv.tickets, 'utf8'))
    if (!Array.isArray(tickets)) throw new Error('not a list of tickets')
  } catch (e) {
    emit('error', { message: `cannot read ${argv.tickets}: ${e.message}` })
    return 2
  }

  const users = parseLogs(readStdin())
  const completeByEmail = new Map(
    [...users.entries()]
      .filter(([, u]) => isComplete(u))
      .map(([userId, u]) => [u.email, { userId, outcome: u.outcome }]),
  )
  const processedEmails = new Set(
    [...users.values()].filter((u) => u.email).map((u) => u.email),
  )

  emit('start', {
    dryRun,
    status: argv.status,
    tickets: tickets.length,
    usersInLogs: users.size,
    completedUsers: completeByEmail.size,
  })

  const stats = { eligible: 0, updated: 0, failed: 0, skipped: 0 }
  const skip = (ticket, reason) => {
    stats.skipped++
    emit('ticket_skipped', { ticketId: ticket.id, reason })
  }

  for (const ticket of tickets) {
    const email = (ticket.requester && ticket.requester.email) || ''
    const key = email.trim().toLowerCase()
    if (['solved', 'closed'].includes(ticket.status)) {
      skip(ticket, `already ${ticket.status}`)
      continue
    }
    if (!key) {
      skip(ticket, 'no requester e-mail')
      continue
    }
    const match = completeByEmail.get(key)
    if (!match) {
      skip(
        ticket,
        processedEmails.has(key)
          ? 'deletion not completely processed in the logs (failure, retry or mail missing), left open'
          : 'requester e-mail is not in the deletion logs',
      )
      continue
    }

    stats.eligible++
    if (dryRun) {
      emit('ticket_would_update', {
        ticketId: ticket.id,
        userId: match.userId,
        status: argv.status,
        outcome: match.outcome,
      })
      continue
    }

    const note =
      argv.note === undefined
        ? defaultNote(match.outcome)
        : argv.note === '' || argv.note === false
        ? null
        : argv.note
    const result = await updateTicket(ticket.id, {
      ticket: {
        status: argv.status,
        ...(note ? { comment: { body: note, public: false } } : {}),
      },
    })
    if (result.ok) {
      stats.updated++
      emit('ticket_updated', {
        ticketId: ticket.id,
        userId: match.userId,
        status: argv.status,
      })
    } else {
      stats.failed++
      emit('ticket_failed', {
        ticketId: ticket.id,
        userId: match.userId,
        httpStatus: result.status,
        detail: result.detail,
      })
    }
  }

  emit('summary', { ...stats, dryRun })
  return stats.failed ? 1 : 0
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    emit('error', { message: e.message })
    process.exit(1)
  })
