#!/usr/bin/env node
/**
 * Downloads the Zendesk tickets tagged "löschanfrage" (deletion requests) and
 * writes
 *   - tickets-<timestamp>.json  the tickets with requester name and e-mail
 *   - emails-<timestamp>.txt    the unique requester e-mail addresses, one per
 *                               line, ready for delete-users.sh / deleteUsers.js
 *
 * Read only: it never changes anything in Zendesk. It talks to Zendesk
 * directly from your machine, not via Heroku.
 *
 * Credentials (environment variables, never put them on the command line):
 *   ZENDESK_SUBDOMAIN     e.g. "republik" for republik.zendesk.com
 * and either
 *   ZENDESK_OAUTH_TOKEN   an OAuth access token (sent as Bearer token)
 * or
 *   ZENDESK_EMAIL         e-mail of the Zendesk agent who owns the API token
 *   ZENDESK_API_TOKEN     Admin Center > Apps and integrations > APIs > API tokens
 *
 * Zendesk is removing API tokens: no new ones can be created from 2026-10-27
 * and none work after 2027-04-30. Existing tokens keep working until then.
 *
 * Usage:
 *   node script/gdpr/zendeskDeletionRequests.js
 *   node script/gdpr/zendeskDeletionRequests.js --status new --status open
 *   node script/gdpr/zendeskDeletionRequests.js --comments --out ./zendesk-export
 *
 * Options:
 *   --tag <tag>       tag to search for (default: löschanfrage)
 *   --status <s>      only tickets with this status (new, open, pending, hold,
 *                     solved, closed); can be repeated. Default: all
 *   --comments        also download all comments of each ticket (slower, and
 *                     contains much more personal data)
 *   --out <dir>       output folder (default: ./zendesk-export)
 *
 * The files contain personal data. They are created readable by you only.
 * Delete them once the requests are handled.
 *
 * NOTE: the requester's e-mail is the address the ticket was written from. It
 * does not have to be the address of the account that should be deleted
 * (someone may write from a different mailbox). Check the list before use.
 */
const fs = require('fs')
const path = require('path')

const {
  ZENDESK_SUBDOMAIN,
  ZENDESK_EMAIL,
  ZENDESK_API_TOKEN,
  ZENDESK_OAUTH_TOKEN,
} = process.env

const args = process.argv.slice(2)
const option = (name) => {
  const values = []
  args.forEach((a, i) => {
    if (a === `--${name}` && args[i + 1] && !args[i + 1].startsWith('--')) {
      values.push(args[i + 1])
    }
  })
  return values
}
const flag = (name) => args.includes(`--${name}`)

const tag = option('tag')[0] || 'löschanfrage'
const statuses = option('status')
const withComments = flag('comments')
const outDir = option('out')[0] || './zendesk-export'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const baseUrl = () => `https://${ZENDESK_SUBDOMAIN}.zendesk.com`

// OAuth access token (Bearer) if given, otherwise e-mail + API token. API tokens
// are being removed by Zendesk (no new ones from 2026-10-27, none work after
// 2027-04-30).
const authHeader = () =>
  ZENDESK_OAUTH_TOKEN
    ? `Bearer ${ZENDESK_OAUTH_TOKEN}`
    : 'Basic ' +
      Buffer.from(`${ZENDESK_EMAIL}/token:${ZENDESK_API_TOKEN}`).toString(
        'base64',
      )

// GET with retry on rate limit (429) and temporary server errors
const get = async (url) => {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: authHeader(), Accept: 'application/json' },
    })
    if (response.ok) {
      return response.json()
    }
    const retryable = response.status === 429 || response.status >= 500
    if (retryable && attempt <= 5) {
      const wait =
        response.status === 429
          ? Number(response.headers.get('retry-after') || 10)
          : attempt * 2
      console.log(`  Zendesk answered ${response.status}, waiting ${wait}s ...`)
      await sleep(wait * 1000)
      continue
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Zendesk refused the credentials (HTTP ${response.status}). Check ZENDESK_SUBDOMAIN and ZENDESK_OAUTH_TOKEN (or ZENDESK_EMAIL and ZENDESK_API_TOKEN, and that API token access is enabled).`,
      )
    }
    throw new Error(`Zendesk request failed: HTTP ${response.status} ${url}`)
  }
}

// cursor based search export: works for more than 1000 results
const searchTickets = async () => {
  const query = [`tags:${tag}`, ...statuses.map((s) => `status:${s}`)].join(' ')
  let url =
    `${baseUrl()}/api/v2/search/export.json` +
    `?filter[type]=ticket&page[size]=100&query=${encodeURIComponent(query)}`
  const tickets = []
  while (url) {
    const page = await get(url)
    tickets.push(...(page.results || []))
    console.log(`  ${tickets.length} ticket(s) so far`)
    url = page.meta && page.meta.has_more ? page.links.next : null
  }
  return tickets
}

const fetchUsers = async (ids) => {
  const users = new Map()
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100)
    const { users: found = [] } = await get(
      `${baseUrl()}/api/v2/users/show_many.json?ids=${chunk.join(',')}`,
    )
    found.forEach((u) => users.set(u.id, u))
  }
  return users
}

const fetchComments = async (ticketId) => {
  const comments = []
  let url = `${baseUrl()}/api/v2/tickets/${ticketId}/comments.json`
  while (url) {
    const page = await get(url)
    comments.push(
      ...(page.comments || []).map((c) => ({
        id: c.id,
        authorId: c.author_id,
        createdAt: c.created_at,
        public: c.public,
        body: c.plain_body || c.body,
      })),
    )
    url = page.next_page
  }
  return comments
}

async function main() {
  const required = ZENDESK_OAUTH_TOKEN
    ? ['ZENDESK_SUBDOMAIN']
    : ['ZENDESK_SUBDOMAIN', 'ZENDESK_EMAIL', 'ZENDESK_API_TOKEN']
  const missing = required.filter((name) => !process.env[name]).join(', ')
  if (missing) {
    console.error(`missing environment variable(s): ${missing}`)
    return 2
  }

  console.log(
    `Searching ${ZENDESK_SUBDOMAIN}.zendesk.com for tag "${tag}"` +
      (statuses.length ? `, status ${statuses.join('/')}` : '') +
      ' ...',
  )
  const found = await searchTickets()
  if (!found.length) {
    console.log('No tickets found.')
    return 0
  }

  const requesterIds = [
    ...new Set(found.map((t) => t.requester_id).filter(Boolean)),
  ]
  const users = await fetchUsers(requesterIds)

  const tickets = []
  for (const [i, t] of found.entries()) {
    const requester = users.get(t.requester_id)
    const ticket = {
      id: t.id,
      url: `${baseUrl()}/agent/tickets/${t.id}`,
      subject: t.subject,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      tags: t.tags,
      requester: {
        id: t.requester_id,
        name: requester ? requester.name : null,
        email: requester && requester.email ? requester.email.trim() : null,
      },
    }
    if (withComments) {
      console.log(`  comments ${i + 1}/${found.length} (ticket ${t.id})`)
      ticket.comments = await fetchComments(t.id)
    }
    tickets.push(ticket)
  }

  const emails = [
    ...new Set(
      tickets
        .map((t) => t.requester.email && t.requester.email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].sort()
  const withoutEmail = tickets.filter((t) => !t.requester.email)

  process.umask(0o077)
  fs.mkdirSync(outDir, { recursive: true, mode: 0o700 })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const ticketsFile = path.join(outDir, `tickets-${stamp}.json`)
  const emailsFile = path.join(outDir, `emails-${stamp}.txt`)
  fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2) + '\n')
  fs.writeFileSync(emailsFile, emails.join('\n') + '\n')

  console.log()
  console.log(`${tickets.length} ticket(s), ${emails.length} unique e-mail(s)`)
  if (withoutEmail.length) {
    console.log(
      `${withoutEmail.length} ticket(s) without requester e-mail: ${withoutEmail
        .map((t) => t.id)
        .join(', ')}`,
    )
  }
  console.log(`tickets: ${ticketsFile}`)
  console.log(`emails:  ${emailsFile}`)
  console.log('Contains personal data, delete when handled.')
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
