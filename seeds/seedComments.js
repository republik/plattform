require('dotenv').config()

/* download comments from reddit
 * https://github.com/not-an-aardvark/snoowrap
 * https://www.reddit.com/prefs/apps
 * https://github.com/not-an-aardvark/reddit-oauth-helper
const snoowrap = require('snoowrap')
const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_REFRESH_TOKEN,
} = process.env
const r = new snoowrap({
  userAgent: 'nodejs:construction.project-r.staging.publikator:v0.0.1 (by /u/patte8)',
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDDIT_REFRESH_TOKEN
})

const fs = require('fs')
Promise.resolve().then( async () => {
  //const comments = await r.getSubmission('74cble').expandReplies({limit: 20, depth: 2})
  const comments = await r.getSubmission('74f7n2').expandReplies({limit: 10, depth: 3})
  console.log(comments)
  fs.writeFileSync(__dirname+'/comments.json', JSON.stringify(comments, null, 2))
})
*/
const crypto = require('crypto')
const fakeUUID = (plainId) => {
  const hash = crypto
    .createHash('sha1')
    .update(plainId)
    .digest('hex')
  return hash.replace(/(.{8})(.{4})(.{4})(.{4})(.{12}).*/, '$1-$2-$3-$4-$5')
}

const _comments = require('./comments.json')
const PgDb = require('../lib/pgdb')

PgDb.connect().then(async (pgdb) => {
  let user = await pgdb.public.users.findFirst({})
  if (!user) {
    user = await pgdb.public.users.insertAndGet({
      email: 'patrick.recher@republik.ch',
      verified: true,
      firstName: 'Patrick',
      lastName: 'Recher'
    })
  }

  await Promise.all([
    pgdb.public.comments.delete({}),
    pgdb.public.discussions.delete({})
  ])

  const discussion = await pgdb.public.discussions.insertAndGet({
    id: fakeUUID('asdf')
  })

  const insertComments = async (comments) => {
    for (let comment of comments) {
      const parentId = comment.parent_id.indexOf('t3') === 0
        ? null
        : fakeUUID(comment.parent_id)

      await pgdb.public.comments.insert({
        id: fakeUUID('t1_' + comment.id),
        discussionId: discussion.id,
        parentId,
        userId: user.id,
        upVotes: comment.ups,
        downVotes: comment.downs,
        hottnes: comment.score, // fixme
        depth: comment.depth,
        content: comment.body,
        createdAt: new Date(comment.created * 1000)
      })

      if (comment.replies.length > 0) {
        await insertComments(comment.replies)
      }
    }
  }

  await insertComments(_comments.comments)
}).then(() => {
  process.exit()
}).catch(e => {
  console.error(e)
  process.exit(1)
})
