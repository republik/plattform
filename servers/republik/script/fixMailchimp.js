/**
 * This script fixes non-members' settings on mailchimp
 *
 * Usage:
 * cat local/mailchimpSubscribedEmails.txt | node script/fixMailchimp.js [restartCount]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
// const fs = require('fs')
const rw = require('rw')
const { enforceSubscriptions } = require('../modules/crowdfundings/lib/Mail.js')

console.log('running fixMailchimp.js...')
PgDb.connect().then(async pgdb => {
  const restartCount = process.argv[2] && parseInt(process.argv[2])
  if (restartCount) {
    console.log(`restartCount: ${restartCount}`)
  }

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input || input.length < 4) {
    throw new Error('You need to provide mailchimp emails as input on stdin')
  }
  const mailchimpSubscribedEmails = new Set(
    input.split('\n')
    // fs.readFileSync(__dirname+'/mailchimpSubscribedEmails.txt', {encoding: 'utf-8'}).split('\n')
  )

  const members = new Set(
    await pgdb.queryOneColumn(`
      SELECT email
      FROM users
      WHERE roles @> '["member"]'
    `)
  )

  const notMembers =
    [...mailchimpSubscribedEmails].filter(x => !members.has(x))

  // const missingMembers =
  //  [...members].filter(x => !mailchimpSubscribedEmails.has(x))
  // console.log(missingMembers.length)
  // console.log(`${mailchimpSubscribedEmails.size} - ${members.size} = ${notMembers.length}`)

  console.log(`updating ${notMembers.length} emails...`)
  let count = 0
  for (let email of notMembers) {
    if (!restartCount || count >= restartCount) {
      console.log(`${count}/${notMembers.length} ${email}`)
      const user = await pgdb.public.users.findOne({email})
      await enforceSubscriptions({
        pgdb,
        userId: user && user.id,
        email
      })
    }
    count += 1
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
