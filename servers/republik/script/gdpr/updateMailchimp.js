/**
 * This script updates members in mailchimp (in bulk)
 *
 * Usage:
 * cat local/mailchimpSubscribedEmails.txt | node script/fixMailchimp.js [restartCount]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const rw = require('rw')
const fetch = require('isomorphic-unfetch')
const { getInterestsForUser } = require('../modules/crowdfundings/lib/Mail.js')
// const util = require('util')
const crypto = require('crypto')
const base64u = require('@orbiting/backend-modules-base64u')
const { authenticate } = require('../lib/Newsletter')
const sleep = require('await-sleep')
const fs = require('fs')
/*
const {
  Consents: {
    consentsOfUser: getConsentsOfUser,
  }
} = require('@orbiting/backend-modules-auth')
*/

const {
  MAILCHIMP_API_KEY,
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_EXPORT_DOWNLOAD_URL
} = process.env

// Interval in seconds stats about bulk progress is printed.
const STATS_INTERVAL_SECS = 2

const hash = (email) =>
  crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex')

const getEmailsFromCSV = (input) =>
   [...new Set(
    input
    .split('\n')
    .slice(1) // remove header
    .map(x => x
      .split(',') // divide columns
      .shift()  // keep only email
    )
  )]
    .filter(Boolean)

const fetchAuthenticated = (method, url, request = {}) => {
  const options = {
    method,
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')
    },
    ...request
  }
  return fetch(url, options)
    .then(r => r.json())
}

console.log('running updateMailchimp.js...')
PgDb.connect().then(async pgdb => {
  const dryRun = process.argv[2] === '--dry'
  if (dryRun) {
    console.log("dry run: this won't change anything on mailchimp")
  }

  const stats = { progress: 0, total: 0 }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, STATS_INTERVAL_SECS * 1000)

  let input
  if (MAILCHIMP_EXPORT_DOWNLOAD_URL) {
    console.log('downloading MAILCHIMP_EXPORT_DOWNLOAD_URL...')
    input = await fetch(MAILCHIMP_EXPORT_DOWNLOAD_URL, { method: 'GET' })
      .then(r => r.text())
  } else {
    console.log('reading stdin MAILCHIMP_EXPORT_DOWNLOAD_URL')
    input = rw.readFileSync('/dev/stdin', 'utf8')
  }
  if (!input || input.length < 4) {
    throw new Error('You need to provide mailchimp emails as input on stdin')
  }

  const mailchimpEmails = getEmailsFromCSV(input)
  console.log(`#mailchimpEmails: ${mailchimpEmails.length}`)
  stats.total = mailchimpEmails.length

  let diffInput
  // diff which need a subscribe URL to a csv
  // only reading of stdin supported yet, so use MAILCHIMP_EXPORT_DOWNLOAD_URL
  // if you need a diff
  if (dryRun && process.argv[3] === '--diff') {
    diffInput = getEmailsFromCSV(rw.readFileSync('/dev/stdin', 'utf8'))
    console.log(`#diffInput: ${diffInput.length}`)
  }

  // load users
  const users = await pgdb.public.users.find({
    email: mailchimpEmails
  })
  console.log(`#users: ${users.length}`)

  let operations = []

  const newsletterName = 'PROJECTR'
  const subscribed = 1
  let numSubscribeUrls = 0
  let emailsWithSubscribeUrl = diffInput && []

  // this is only correct as long as PRIVACY is not REVOKEable
  const privacyConsentsUserIds = await pgdb.queryOneColumn(`
    SELECT DISTINCT("userId")
    FROM consents c
    WHERE c.policy = 'PRIVACY' AND c.record = 'GRANT'
  `)
  console.log(`#privacyConsents: ${privacyConsentsUserIds.length}`)

  const missingConsent = (userId) => {
    return privacyConsentsUserIds.indexOf(userId) === -1
  }

  await Promise.all(mailchimpEmails.map(async (email) => {
  // mailchimpEmails.forEach( email => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    const interests = await getInterestsForUser({
      userId: !!user && user.id,
      pgdb
    })
    let subscribeUrl = ''
    if (!user || missingConsent(user.id)) {
      const mac = authenticate(email, newsletterName, subscribed)
      const base64uMail = base64u.encode(email)
      subscribeUrl = `https://www.republik.ch/mitteilung?type=newsletter-subscription&name=${newsletterName}&subscribed=${subscribed}&context=gdpr&email=${base64uMail}&mac=${mac}`
    }
    operations.push({
      method: 'PUT',
      path: `/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash(email)}`,
      body: JSON.stringify({
        // body <- don't touch, would change subscription status
        email_address: email,
        status_if_new: 'subscribed',
        interests,
        'merge_fields': {
          'SUB_URL': subscribeUrl
        }
      })
    })
    if (subscribeUrl && subscribeUrl.length > 2) {
      numSubscribeUrls += 1
      if (emailsWithSubscribeUrl) {
        emailsWithSubscribeUrl.push(email)
      }
    }
    stats.progress += 1
  }))
  // })
  // console.log(util.inspect(operations, {depth: null}))
  console.log(stats)
  clearInterval(statsInterval)
  console.log(`#operations: ${operations.length}`)
  console.log(`#subscribeUrls: ${numSubscribeUrls}`)

  if (diffInput) {
    diffInput = diffInput.map(email => email.toLowerCase())
    const missingInDiffInput = emailsWithSubscribeUrl.filter(
      email => diffInput.indexOf(email.toLowerCase()) === -1
    )
    console.log(`#diff emailsWithSubscribeUrl <> diffInput: ${emailsWithSubscribeUrl.length - diffInput.length}`)
    // console.log(util.inspect(missingInDiffInput, {depth: null}))
    fs.writeFileSync(__dirname + '/diff.csv', missingInDiffInput.join('\n'))
  }

  if (!dryRun) {
    const batchesUrl = `${MAILCHIMP_URL}/3.0/batches`

    const result = await fetchAuthenticated('POST', batchesUrl, {
      body: JSON.stringify({
        operations
      })
    })
    console.log('started:', result)

    let statusResult
    let lastStatus
    do {
      statusResult = await fetchAuthenticated('GET', `${batchesUrl}/${result.id}`)
      const newStatus = statusResult && statusResult.status
      if (lastStatus && lastStatus !== newStatus) {
        console.log('status changed: ', statusResult)
      }
      lastStatus = newStatus
      await sleep(1000)
    } while (!statusResult || statusResult.status !== 'finished')

    /* result is tar :(
    if(lastStatus === 'finished') {
      const summary = await fetch(statusResult.response_body_url, { method: 'GET' })
        .then( r => r.raw() )
      console.log(summary)
    }
    */
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
