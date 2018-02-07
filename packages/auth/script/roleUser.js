//
// This script adds/removes a role to/from a user.
//
// usage
// auth  node script/roleUser.js supporter patrick.recher@project-r.construction [remove]
//

// use pogi directly to not create a circular dependency to backend-modules-base
const { PgDb } = require('pogi')
const Roles = require('../lib/Roles')

require('@orbiting/backend-modules-env').config()

const {
  DATABASE_URL
} = process.env

PgDb.connect({connectionString: DATABASE_URL}).then(async (pgdb) => {
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
