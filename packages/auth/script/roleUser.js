//
// This script adds/removes a role to/from a user.
//
// usage
// auth  node script/roleUser.js supporter patrick.recher@project-r.construction [remove]
//

const PgDb = require('../lib/pgdb')
const Roles = require('../lib/Roles')

require('dotenv').config()

PgDb.connect().then(async (pgdb) => {
  const role = process.argv[2]
  const email = process.argv[3]

  if (!role) {
    throw new Error('first parameter must be the role to add')
  }
  if (!email) {
    throw new Error('second parameter must be the email to add the role to')
  }

  const user = await pgdb.public.users.findOne({email})
  if (!user) {
    throw new Error(`user with email ${email} not found!`)
  }

  let newUser
  if (process.argv[4]) {
    newUser = await Roles.removeUserFromRoll(user.id, role, pgdb)
  } else {
    newUser = await Roles.addUserToRole(user.id, role, pgdb)
  }
  console.log(newUser)

  console.log('job done!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
