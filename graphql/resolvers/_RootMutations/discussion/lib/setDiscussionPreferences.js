module.exports = async ({
  discussionPreferences,
  userId,
  discussion,
  transaction,
  t
}) => {
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
    discussionId: discussion.id
  }
  const updateQuery = {
    userId,
    discussionId: discussion.id,
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
