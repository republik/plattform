/**
 * This script adds/removes a badge to/from a user.
 *
 * Usage:
 * node script/userBadge.js PATRON sample@email.com [remove]
 */
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Badges = require('../lib/Badges')

PgDb.connect()
  .then(async pgdb => {
    const badge = process.argv[2]
    const email = process.argv[3]

    if (!badge) {
      throw new Error('first parameter must be the badge to add')
    }
    if (!email) {
      throw new Error('second parameter must be the email to add the badge to')
    }

    const user = await pgdb.public.users.findOne({ email })
    if (!user) {
      throw new Error(`user with email ${email} not found!`)
    }
    console.log(`Supported badges:\n${Badges.SUPPORTED_BADGES.join('\n')}`)

    let newUser
    if (process.argv[4]) {
      newUser = await Badges.removeFromUser(user.id, badge, pgdb)
    } else {
      if (Badges.SUPPORTED_BADGES.indexOf(badge) === -1) {
        throw new Error(
          `badge ${badge} is not supported, you can only remove it.`
        )
      }
      newUser = await Badges.addToUser(user.id, badge, pgdb)
    }
    console.log(newUser)
    console.log('job done!')
  })
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
