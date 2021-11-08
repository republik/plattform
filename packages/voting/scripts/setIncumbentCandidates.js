/*  Sets candidates to incumbent if they were elected at the previous election and run for current election again

    usage: 
    - in general: node setIncumbentCandidates.js <current-election-slug> <previous-election-slug>
    - election slug can be found by querying elections 
    - e.g.: node setIncumbentCandidates.js gen21m gen18m
*/
require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect()
  .then(async (pgdb) => {
    const currentSlug = process.argv[2]
    const previousSlug = process.argv[3]

    if (!currentSlug || !previousSlug) {
      throw new Error(
        'Please specify slugs of previous and current election, e.g. node setIncumbentCandidates.js gen21m gen18m',
      )
    }

    const previousElectionResult = await pgdb.public.elections.findOneFieldOnly(
      { slug: previousSlug },
      'result',
    )
    const incumbentCandidates = previousElectionResult?.candidacies?.filter(
      (candidacy) => candidacy.elected,
    )

    if (!incumbentCandidates?.length) {
      console.log(
        'Nothing to do - either no previous election found or no previously elected candidates',
      )
      return
    }

    const currentElectionId = await pgdb.public.elections.findOneFieldOnly(
      { slug: currentSlug },
      'id',
    )

    if (!currentElectionId) {
      throw new Error(`no current election with slug ${currentSlug} found`)
    }

    await Promise.all(
      incumbentCandidates.map(async (incumbentCandidate) => {
        try {
          const updatedCandidacy =
            await pgdb.public.electionCandidacies.updateAndGetOne(
              {
                userId: incumbentCandidate.candidacy.userId,
                electionId: currentElectionId,
                incumbent: false,
              },
              { incumbent: true },
            )
          if (updatedCandidacy) {
            console.log(
              `successfully updated candidate with userId ${incumbentCandidate.candidacy.userId} to incumbent`,
            )
          }
        } catch (e) {
          console.log(
            `error while updating ${incumbentCandidate.candidacy.userId}: ${e}`,
          )
        }
      }),
    )
  })
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
