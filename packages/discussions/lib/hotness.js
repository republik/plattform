// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9

const HOTNESS_TIME_DENOMINATOR = parseFloat(process.env.HOTNESS_TIME_DENOMINATOR) || 13000.0
const debug = require('debug')('discussion:lib:hotness')

module.exports = (upVotes, downVotes, timestamp) => {
  const { log2, log10, max, abs } = Math

  const score = upVotes - downVotes
  const order = log2(
    max(
      abs(score),
      1
    )
  )
  const sign = (score > 0) ? 1 : ((score < 0) ? -1 : 0)

  const absVotes = upVotes + downVotes
  const orderReactions = log10(
    max(
      abs(absVotes),
      1
    )
  )

  const seconds = timestamp / 1000.0 - 1493190000 // republik epoch
  const hotness = (sign * order + orderReactions + (seconds / HOTNESS_TIME_DENOMINATOR)).toFixed(7)
  debug({
    sign,
    order,
    orderReactions,
    seconds,
    timePart: seconds / HOTNESS_TIME_DENOMINATOR,
    hotness
  })
  return hotness
}
