const _ = require('lodash')

const { buildQueries } = require('./queries.js')
const queries = buildQueries('votings')
const {
  findBySlug,
  insertAllowedMemberships
} = queries

const create = async (input, pgdb) => {
  const voting = await pgdb.public.votings.insertAndGet(
    _.omit(input, ['options', 'allowedMemberships'])
  )

  if (input.options && input.options.length > 0) {
    await Promise.all(
      input.options.map(option =>
        pgdb.public.votingOptions.insert({
          votingId: voting.id,
          ...option
        })
      )
    )
  }

  if (input.allowedMemberships && input.allowedMemberships.length > 0) {
    await insertAllowedMemberships(voting.id, input.allowedMemberships, pgdb)
  }

  return findBySlug(input.slug, pgdb)
}

const getOptions = async (votingId, pgdb) => {
  return pgdb.public.votingOptions.find({
    votingId
  })
}

const getOptionsResult = async (voting, { winnerName }, pgdb) => {
  const counts = await pgdb.query(`
    SELECT
      COUNT(*) AS count,
      "votingOptionId"
    FROM
      ballots
    WHERE
      "votingId" = :votingId
    GROUP BY
      "votingOptionId"
    ORDER BY
      count DESC
  `, {
    votingId: voting.id
  })

  let winnerOptionId
  const nonEmptyCounts = counts.filter(c => !!c.votingOptionId)
  if (nonEmptyCounts.length) { // nothing wins if all voted empty
    if (
      nonEmptyCounts.length > 1 &&
      nonEmptyCounts[0].count === nonEmptyCounts[1].count // undecided
    ) {
      if (winnerName) {
        const winner = nonEmptyCounts.find(c => c.name === winnerName)
        winnerOptionId = winner && winner.votingOptionId
      }
      if (!winnerOptionId && winnerName) {
        throw new Error(`voting is undecided and a votingOption with the name '${winnerName}' could not be found!`)
      }
    } else {
      winnerOptionId = nonEmptyCounts[0].votingOptionId
    }
  }

  return getOptions(voting.id, pgdb)
    .then(options =>
      options.map(option => {
        const countResult = counts.find(c => c.votingOptionId === option.id)
        return {
          option,
          count: countResult ? countResult.count : 0,
          winner: option.id === winnerOptionId
        }
      })
    )
    .then(options => {
      const emptyBallotsResult = counts.find(c => c.votingOptionId === null)
      if (emptyBallotsResult) {
        return options.concat({
          option: null,
          count: emptyBallotsResult.count,
          winner: false
        })
      }
      return options
    })
}

module.exports = {
  ...queries,
  create,
  getOptions,
  getOptionsResult
}
