const hotness = require('../../../../../lib/hotness')

module.exports = async (commentId, vote, pgdb, user, t, pubsub) => {
  if (vote !== 1 && vote !== -1) {
    console.error('vote out of range', { commentId, vote })
    throw new Error(t('api/unexpected'))
  }
  const transaction = await pgdb.transactionBegin()
  try {
    const comment = (await transaction.query(`
      SELECT *
      FROM comments
      WHERE
        id = :commentId
      FOR UPDATE
    `, {
      commentId
    }))[0]
    if (!comment) {
      throw new Error(t('api/comment/404'))
    }

    const existingUserVote = comment.votes.find(vote => vote.userId === user.id)
    let newComment
    if (!existingUserVote) {
      newComment = await transaction.public.comments.updateAndGetOne({
        id: commentId
      }, {
        upVotes: (vote === 1 ? comment.upVotes + 1 : comment.upVotes),
        downVotes: (vote === 1 ? comment.downVotes : comment.downVotes + 1),
        votes: comment.votes.concat([{
          userId: user.id,
          vote
        }])
      })
    } else if (existingUserVote.vote !== vote) {
      newComment = await transaction.public.comments.updateAndGetOne({
        id: commentId
      }, {
        upVotes: comment.upVotes + vote,
        downVotes: comment.downVotes - vote,
        votes: comment.votes.filter(vote => vote.userId !== user.id).concat([{
          userId: user.id,
          vote
        }])
      })
    }

    if (newComment) {
      newComment = await transaction.public.comments.updateAndGetOne({
        id: commentId
      }, {
        hotness: hotness(newComment.upVotes, newComment.downVotes, newComment.createdAt.getTime())
      })
    }

    await transaction.transactionCommit()

    if (newComment) {
      await pubsub.publish('comment', { comment: {
        mutation: 'UPDATED',
        node: newComment
      }})
    }

    return newComment || comment
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
