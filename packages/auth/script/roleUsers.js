//
// This script adds/removes a role to/from users.
//
// usage
// cat seeds/seeds.example.json | node script/roleUsers.js add/remove [create]
//
// This script expects a json with users and their roles on stdin.
// For the expected format check seeds/seeds.example.json
//
// Provide add or remove as the first parameter whether you want the specified
// roles to be added or removed from the users.
//
// Only if you provide --create non-existing users will be created.
//

// use pogi directly to not create a circular dependency to backend-modules-base
const { PgDb } = require('pogi')
const Roles = require('../lib/Roles')
const rw = require('rw')

require('@orbiting/backend-modules-env').config()

const {
  DATABASE_URL
} = process.env

PgDb.connect({connectionString: DATABASE_URL}).then(async (pgdb) => {
  const input = JSON.parse(rw.readFileSync('/dev/stdin', 'utf8'))
  if (!input || !input.users || !input.users.length) {
    console.log('please provide a users array on stdin!')
    process.exit(1)
  }

  const operation = process.argv[2]
  if (operation !== 'add' && operation !== 'remove') {
    console.error('add or remove must be passed as the first param!')
    process.exit(1)
  }
  const add = operation === 'add'

  const create = !!process.argv[3]

  const transaction = await pgdb.transactionBegin()
  let promises = []
  try {
    let skippedEmails = []
    for (let user of input.users) {
      let existingUser = await transaction.public.users.findOne({
        email: user.email
      })
      if (!existingUser) {
        if (create) {
          existingUser = await transaction.public.users.insertAndGet({
            ...user
          })
        } else {
          skippedEmails.push(user.email)
        }
      }
      if (existingUser) {
        for (let role of user.roles) {
          if (add) {
            promises.push(
              Roles.addUserToRole(existingUser.id, role, transaction)
            )
          } else {
            promises.push(
              Roles.removeUserFromRole(existingUser.id, role, transaction)
            )
          }
        }
      }
    }

    await Promise.all(promises)
    console.log(await transaction.public.users.find({ email: input.users.map(u => u.email) }))

    if (skippedEmails.length > 0) {
      console.log('no user found for the following emails:')
      console.log('(use this script with --create to automatically create them)')
      console.log(skippedEmails.join('\n'))
    }

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.warn('transaction rollback')
    throw e
  }

  console.log('job done!')
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
