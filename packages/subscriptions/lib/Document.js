const {
  getSubscriptionsForUserAndObjects,
  getSimulatedSubscriptionForUserAndObject,
} = require('./Subscriptions')
const { getRepoId } = require('@orbiting/backend-modules-documents/lib/resolve')
const {
  getRepoIdsForDoc,
  getTemplate,
  getAuthorUserIds
} = require('@orbiting/backend-modules-documents/lib/meta')
const { v4: isUuid } = require('is-uuid')
const Promise = require('bluebird')

const getSubscriptionsForDoc = async (
  doc,
  userId,
  {
    onlyEligibles = false,
    includeParents = false,
    includeNotActive = false,
    uniqueUsers = false,
    simulate = false,
  },
  context
) => {
  const subscriptions = []

  const repoIds = getRepoIdsForDoc(doc, includeParents)

  const docsSubscriptions = await getSubscriptionsForUserAndObjects(
    userId,
    {
      type: 'Document',
      ids: repoIds
    },
    context,
    {
      onlyEligibles,
      includeParents,
      includeNotActive
    }
  )
  if (docsSubscriptions.length) {
    docsSubscriptions.forEach(s => subscriptions.push(s))
  } else if (simulate && (repoIds.length > 1 || getTemplate(doc) === 'format')) {
    subscriptions.push(
      getSimulatedSubscriptionForUserAndObject(
        userId,
        {
          type: 'Document',
          id: repoIds[repoIds.length - 1] // format see getRepoIdsForDoc
        },
        context
      )
    )
  }

  // from prepareMetaForPublish
  const authorUserIds = doc.meta?.authorUserIds || await getAuthorUserIds(doc, context)
  if (authorUserIds.length) {
    const authorSubscriptions = await getSubscriptionsForUserAndObjects(
      userId,
      {
        type: 'User',
        ids: authorUserIds
      },
      context,
      {
        onlyEligibles,
        includeParents,
        includeNotActive
      }
    )
    authorSubscriptions.forEach(s => subscriptions.push(s))

    if (simulate) {
      const userIds = authorSubscriptions.map(s => s.objectUserId)
      authorUserIds
        .filter(id => !userIds.includes(id))
        .map(id => getSimulatedSubscriptionForUserAndObject(
          userId,
          {
            type: 'User',
            id
          },
          context
        ))
        .forEach(sub => subscriptions.push(sub))
    }
  }

  if (uniqueUsers) {
    return subscriptions
      .filter( (sub1, index1, arr) => arr
        .findIndex( (sub2, index2) =>
          sub2.userId === sub1.userId && index2 < index1
        ) === -1
      )
  }
  return subscriptions
}

module.exports = {
  getRepoIdsForDoc,
  getAuthorUserIds,
  getSubscriptionsForDoc
}
