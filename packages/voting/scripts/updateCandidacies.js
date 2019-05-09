// updates/inserts recommendations to candidacies
//
// reads from stdin. format:
// [
//  {
//    "id": "0b557010-2000-400f-9064-a09290000000",
//    "recommendation": "very good person, highly recoomended",
//    "user": {
//      "id": "00000000-0000-0000-0000-000000000000",
//      "name": "Thomas Jefferson"
//    }
//  },
//  { ... },
//  ...
// ]
//
// usage:
// cat packages/voting/scripts/local/candidacies.json | node packages/voting/scripts/updateCandidacies.js

const rw = require('rw')
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

const candidacies = JSON.parse(rw.readFileSync('/dev/stdin', 'utf8'))

PgDb.connect().then(async pgdb => {
  for (let candidate of candidacies) {
    console.log(`updating ${candidate.user.name}...`)
    await pgdb.public.electionCandidacies.updateOne(
      { id: candidate.id },
      { recommendation: candidate.recommendation }
    )
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
