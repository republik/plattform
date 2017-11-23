//
// This script adds/removes a role to/from users.
//
// usage
// auth  node script/roleUsers.js supporter emails.json [remove]
// The second paramenter must be a path (relative to this file) to a json
// file containing an array with user emails.
// If a user is not found, he/she is skipped.
//
//

const { PgDb } = require('pogi')
const Roles = require('../lib/Roles')

require('dotenv').config()

PgDb.connect({connectionString: process.env.DATABASE_URL}).then(async (pgdb) => {
  const role = process.argv[2]
  const emailsPath = process.argv[3]

  if (!role) {
    throw new Error('first parameter must be the role to add')
  }
  if (!emailsPath) {
    throw new Error('second parameter must be a path to a json file containing emails')
  }
  const emails = require(emailsPath)
  if (!emails || emails.length === 0) {
    throw new Error('emails input invalid')

  }

  let skippedEmails = []
  for(let email of emails) {
    const user = await pgdb.public.users.findOne({email})
    if (!user) {
      skippedEmails.push(email)
    } else {
      let newUser
      if (process.argv[4]) {
        newUser = await Roles.removeUserFromRoll(user.id, role, pgdb)
      } else {
        newUser = await Roles.addUserToRole(user.id, role, pgdb)
      }
      console.log(newUser)
    }
  }
  console.log('no user found for the following emails:')
  console.log(skippedEmails.join('\n'))

  console.log('job done!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
