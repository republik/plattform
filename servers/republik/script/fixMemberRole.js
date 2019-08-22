/**
 * This script fixes users with member roles, without owning a membership.
 * Mailchimp settings are also enforced
 *
 * Usage:
 * cat local/fixMemberRole.txt | node script/fixMemberRole.js [restartCount]
 */
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')
// const fs = require('fs')
const rw = require('rw')
const { enforceSubscriptions } = require('../modules/crowdfundings/lib/Mail.js')
const { Roles } = require('@orbiting/backend-modules-auth')

console.log('running fixMemberRole.js...')
PgDb.connect().then(async pgdb => {
  const restartCount = process.argv[2] && parseInt(process.argv[2])
  if (restartCount) {
    console.log(`restartCount: ${restartCount}`)
  }

  const input = rw.readFileSync('/dev/stdin', 'utf8')
  if (!input || input.length < 4) {
    throw new Error('You need to provide mailchimp emails as input on stdin')
  }
  const emails = [...new Set(
    input.split('\n')
  )]

  let notMembers = []
  for (let email of emails) {
    const user = await pgdb.public.users.findOne({ email })
    if (!user) {
      console.warn(`user not found for email: ${email}`)
      continue
    }
    if (await hasUserActiveMembership(user, pgdb)) {
      console.warn(`user has active membership. email: ${email}, id: ${user.id}`)
    } else {
      notMembers.push(user)
    }
  }

  console.log(`updating ${notMembers.length} users...`)
  let count = 0
  for (let user of notMembers) {
    if (!restartCount || count >= restartCount) {
      console.log(`${count}/${notMembers.length} ${user.email}`)
      await Roles.removeUserFromRole(user.id, 'member', pgdb)
      await enforceSubscriptions({
        pgdb,
        userId: user && user.id,
        email: user.email
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
