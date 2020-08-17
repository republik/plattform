#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Promise = require('bluebird')
const getHotness = require('@orbiting/backend-modules-discussions/lib/hotness')
const moment = require('moment')
const { descending } = require('d3-array')

const discussionId = process.argv[2]
if (!discussionId) {
  throw new Error('provide discussion id as first param')
}

Promise.props({
  pgdb: PgDb.connect()
}).then(async (connections) => {
  const { pgdb } = connections
  const now = moment()

  const comments = await pgdb.public.comments.find({
    discussionId
  })
    .then(cs => cs
      .sort((a, b) => descending(a.createdAt, b.createdAt))
      .map((c, i) => ({ ...c, timeIndex: i }))
      .sort((a, b) => descending(a.hotness, b.hotness))
      .map((c, i) => ({ ...c, oldIndex: i }))
    )

  const newComments = await Promise.map(
    comments,
    async (comment) => {
      const { id, upVotes, downVotes, createdAt, hotness: oldHotness } = comment
      const hotness = getHotness(upVotes, downVotes, createdAt.getTime())
      await pgdb.public.comments.updateOne(
        { id },
        { hotness }
      )
      return {
        ...comment,
        oldHotness,
        hotness
      }
    }
  )

  newComments
    .sort((a, b) => descending(a.hotness, b.hotness))
    .map(({
      upVotes,
      downVotes,
      createdAt,
      hotness,
      oldHotness,
      oldIndex,
      timeIndex
    }, index) => {
      console.log({
        score: upVotes - downVotes,
        age: moment(createdAt).from(now),
        c: moment(createdAt).toString(),
        // oldHotness,
        hotness,
        // diffHotness: hotness - oldHotness,
        // oldIndex,
        index,
        // diffIndex: index - oldIndex,
        timeIndex,
        diffTimeIndex: timeIndex - index
      })
    })

  console.log(`${comments.length} comments updated`)
  console.log({ HOTNESS_TIME_DENOMINATOR: process.env.HOTNESS_TIME_DENOMINATOR })

  return connections
})
  .then(async ({ pgdb }) => {
    await PgDb.disconnect(pgdb)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
