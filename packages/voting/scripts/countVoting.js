//
// This script counts the ballots of a vote and upserts vote.result
// params
//   slug
//   optional: message
//   optional: winner's votingOption.name (in case of final vote)
//   optional: video: hls, mp4, youtube, subtitles (if given, hls and mp4 are required)
//   optional: no-freeze: don't freeze turnout and stats into result
//
// usage
// node countVoting.js --slug SLUG [--message MESSAGE] [--winner WINNER] [--hls url] [--mp4 url] [--youtube url] [--subtitles url] [--no-freeze]
//

require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const VotingResult = require('../graphql/resolvers/VotingResult')
const VotingTurnout = require('../graphql/resolvers/VotingTurnout')
const { findBySlug } = require('../lib/Voting')
const util = require('util')
const moment = require('moment')

const getVideo = ({ hls, mp4, youtube, subtitles, poster }) => {
  if (hls || mp4 || youtube || subtitles || poster) {
    if (!hls || !mp4) {
      throw new Error('hls and mp4 are required for video')
    }
    return {
      hls,
      mp4,
      youtube,
      subtitles,
      poster
    }
  }
  return null
}

PgDb.connect().then(async (pgdb) => {
  const argv = require('minimist')(process.argv.slice(2))

  const { slug, message, winner: winnerName } = argv
  const freeze = argv.freeze !== false

  if (!slug) { throw new Error('slug must be provided') }

  console.log('counting vote...')

  const transaction = await pgdb.transactionBegin()
  try {
    const voting = await findBySlug(slug, transaction)
    if (!voting) {
      throw new Error(`a voting with the slug '${slug}' could not be found!`)
    }

    const entity = { entity: voting }
    const context = { pgdb: transaction }

    const options = await VotingResult.options(
      entity,
      { winnerName },
      context
    )

    const turnout = {
      eligible: await VotingTurnout.eligible(entity, null, context),
      submitted: await VotingTurnout.submitted(entity, null, context)
    }

    const now = new Date()
    const result = {
      options,
      updatedAt: now,
      createdAt: voting.result ? voting.result.createdAt : now,
      message, // ignored by postgres if null
      video: getVideo(argv),
      turnout
    }

    let updatedVoting
    if (freeze) {
      const closeVoting = moment(voting.endDate).isAfter(moment(now))
      updatedVoting = await pgdb.public.votings.updateAndGetOne(
        { id: voting.id },
        {
          result,
          ...closeVoting ? { endDate: now } : { }
        }
      )
    }

    console.log('finished! The result is:')

    console.log(util.inspect(updatedVoting ? updatedVoting.result : result, {depth: 3}))
    console.log(`The result ${!updatedVoting ? 'has NOT' : 'HAS'} been written to the DB`)
    console.log('🎉🎉🎉🎉🎉🎉')
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
