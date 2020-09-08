const { MAX_CREDENTIAL_LENGTH } = require('./Credential')
const { ensureStringLength } = require('@orbiting/backend-modules-utils')

const setDiscussionPreferences = async ({
  discussionPreferences,
  userId,
  discussion,
  transaction,
  t
}) => {
  const {
    credential: credentialDescription
  } = discussionPreferences

  // default anonymity
  let anonymity
  if (discussionPreferences.anonymity === undefined) {
    anonymity = discussion.anonymity === 'ENFORCED'
  } else {
    anonymity = discussionPreferences.anonymity
  }

  if (anonymity && discussion.anonymity === 'FORBIDDEN') {
    throw new Error(t('api/discussion/anonymity/forbidden'))
  } else if (anonymity === false && discussion.anonymity === 'ENFORCED') {
    throw new Error(t('api/discussion/anonymity/enforced'))
  }

  let credentialId
  if (credentialDescription) {
    ensureStringLength(credentialDescription, {
      max: MAX_CREDENTIAL_LENGTH,
      min: 1,
      error: t('profile/generic/notInRange', {
        key: t('profile/credential/label'),
        min: 1,
        max: MAX_CREDENTIAL_LENGTH
      })
    })
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
  } else if (credentialDescription === null) {
    credentialId = null
  }

  const findQuery = {
    userId,
    discussionId: discussion.id
  }
  const existingDP = await transaction.public.discussionPreferences.findOne(findQuery)
  const user = await transaction.public.users.findOne({ id: userId })

  const updateQuery = {
    userId,
    discussionId: discussion.id,
    anonymous: anonymity,
    ...credentialId !== undefined
      ? { credentialId }
      : { },
    notificationOption:
      discussionPreferences.notifications ||
      (existingDP && existingDP.notificationOption) ||
      user.defaultDiscussionNotificationOption
  }
  const options = {
    skipUndefined: true
  }

  if (existingDP) {
    await transaction.public.discussionPreferences.updateOne(findQuery, updateQuery, options)
  } else {
    await transaction.public.discussionPreferences.insert(updateQuery, options)
  }

  await ensureAnonymousDifferentiator({
    transaction,
    userId,
    discussion,
    t
  })
}

const ensureAnonymousDifferentiator = async ({
  transaction,
  userId,
  discussion,
  t
}) => {
  // const discussionId = discussion.id
  const discussionId = discussion.id
  const findQuery = {
    userId, discussionId
  }

  const preferences = transaction.public.discussionPreferences.findOne(findQuery)

  if (preferences && preferences.anonymousDifferentiator) {
    return
  }

  const userHasComments = !!await transaction.public.comments.findOne({
    userId, discussionId
  })

  if (!userHasComments) {
    return
  }

  if (discussion.anonymity === 'FORBIDDEN') {
    return
  }

  if (!preferences && discussion.anonymity === 'ENFORCED') {
    // setDiscussionPreferences() will set discussionPreferences.annonymous to true
    // and recursively call ensureAnonymousDifferentiator()

    await setDiscussionPreferences({
      userId,
      discussion,
      transaction,
      t
    })

    return
  }

  if (!preferences || !preferences.anonymous) {
    return
  }

  const lastUsed = await transaction.public.discussionPreferences.findOne({
    discussionId: discussion.id,
    'anonymousDifferentiator !=': null
  }, { orderBy: { anonymousDifferentiator: 'DESC' } })

  transaction.public.discussionPreferences.updateOne(findQuery, {
    anonymousDifferentiator: lastUsed ? lastUsed.anonymousDifferentiator + 1 : 1
  })
}

module.exports = {
  setDiscussionPreferences,
  ensureAnonymousDifferentiator
}
