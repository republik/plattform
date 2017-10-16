// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
module.exports = (upVotes, downVotes, timestamp) => {
  const {log, max, abs} = Math

  const score = upVotes - downVotes
  const order = log(max(abs(score), 1), 10)
  const sign = (score > 0) ? 1 : ((score < 0) ? -1 : 0)

  const absVotes = upVotes + downVotes
  const orderReactions = log(max(abs(absVotes / 10.0), 1), 10)

  const seconds = timestamp / 1000.0 - 1493190000 // republik epoch
  return (sign * order + orderReactions + seconds / 30000.0).toFixed(7)
}
