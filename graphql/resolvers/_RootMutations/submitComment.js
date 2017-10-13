const Roles = require('../../../lib/Roles')
const hottnes = require('../../../lib/hottnes')

module.exports = async (_, args, {pgdb, user, t}) => {
  Roles.ensureUserHasRole(user, 'member')

  const userId = user.id
  const {
    discussionId,
    parentId,
    content,
    discussionPreferences
  } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id: discussionId
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    // ensure user is within minInterval
    if (discussion.minInterval) {
      const now = new Date().getTime()
      const lastCommentByUser = await transaction.public.comments.findFirst({
        userId,
        discussionId,
        published: true
      }, {
        orderBy: ['createdAt desc']
      })
      if (lastCommentByUser && lastCommentByUser.createdAt.getTime() > now - discussion.minInterval) {
        const waitForMinutes = (lastCommentByUser.createdAt.getTime() + discussion.minInterval - now) / 1000 / 60
        let waitFor
        if (waitForMinutes <= 60) { waitFor = Math.ceil(waitForMinutes) + 'm' } else { waitFor = Math.ceil(waitForMinutes / 60) + 'h' }
        throw new Error(t('api/comment/tooEarly', { waitFor }))
      }
    }

    // ensure comment length is within limit
    if (discussion.maxLength && content.length > discussion.maxLength) {
      throw new Error(t('api/comment/tooLong', { maxLength: discussion.maxLength }))
    }

    if (discussionPreferences) {
      const {
        anonymity,
        credential: credentialDescription
      } = discussionPreferences

      if (anonymity && discussion.anonymity === 'FORBIDDEN') {
        throw new Error(t('api/discussion/anonymity/forbidden'))
      } else if (anonymity === false && discussion.anonymity === 'ENFORCED') {
        throw new Error(t('api/discussion/anonymity/enforced'))
      }

      let credentialId
      if (credentialDescription) {
        const existingCredential = await transaction.public.credentials.findOne({
          userId,
          description: credentialDescription
        })
        if (existingCredential) {
          credentialId = existingCredential.id
        } else {
          const newCredential = await transaction.public.credentials.insertAndGet({
            userId,
            description: credentialDescription
          })
          credentialId = newCredential.id
        }
      }

      const findQuery = {
        userId,
        discussionId
      }
      const updateQuery = {
        anonymous: anonymity,
        credentialId
      }
      const options = {
        skipUndefined: true
      }
      const dpExists = await transaction.public.discussionPreferences.findFirst(findQuery)
      if (dpExists) {
        await transaction.public.discussionPreferences.updateOne(findQuery, updateQuery, options)
      } else {
        await transaction.public.discussionPreferences.insert(updateQuery, options)
      }
    }

    const comment = await transaction.public.comments.insertAndGet({
      discussionId: discussion.id,
      parentId,
      userId,
      content,
      hottnes: hottnes(0, 0, (new Date().getTime()))
    }, {
      skipUndefined: true
    })

    await transaction.transactionCommit()

    return comment
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
