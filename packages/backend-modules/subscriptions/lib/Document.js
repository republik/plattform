const {
  getSubscriptionsForUserAndObjects,
  getSimulatedSubscriptionForUserAndObject,
} = require('./Subscriptions')
const {
  getRepoIdsForDoc,
  getContributors,
} = require('@orbiting/backend-modules-documents/lib/meta')

const getSubscriptionsForDoc = async (
  doc,
  userId,
  {
    filters = false,
    onlyEligibles = false,
    includeParents = false,
    includeNotActive = false,
    uniqueUsers = false,
    simulate = false,
  },
  context,
) => {
  const subscriptions = []

  const repoIds = getRepoIdsForDoc(doc, includeParents)

  const docsSubscriptions = await getSubscriptionsForUserAndObjects(
    userId,
    {
      type: 'Document',
      ids: repoIds,
      filters,
    },
    context,
    {
      onlyEligibles,
      includeParents,
      includeNotActive,
    },
  )

  docsSubscriptions.forEach((s) => subscriptions.push(s))

  if (simulate) {
    repoIds
      .filter(
        (repoId) =>
          !docsSubscriptions.map((s) => s.objectDocumentId).includes(repoId),
      )
      .map((repoId) =>
        getSimulatedSubscriptionForUserAndObject(
          userId,
          {
            type: 'Document',
            id: repoId,
            filters,
          },
          context,
        ),
      )
      .forEach((sub) => subscriptions.push(sub))
  }

  // from prepareMetaForPublish
  const contributors = getContributors(doc.meta || doc._meta)
  const contributorUserIds = contributors.map((c) => c.userId).filter(Boolean)
  if (contributorUserIds.length) {
    const authorSubscriptions = await getSubscriptionsForUserAndObjects(
      userId,
      {
        type: 'User',
        ids: contributorUserIds,
        filters,
      },
      context,
      {
        onlyEligibles,
        includeParents,
        includeNotActive,
      },
    )
    authorSubscriptions.forEach((s) => subscriptions.push(s))

    if (simulate) {
      const userIds = authorSubscriptions.map((s) => s.objectUserId)
      contributorUserIds
        .filter((id) => !userIds.includes(id))
        .map((id) =>
          getSimulatedSubscriptionForUserAndObject(
            userId,
            {
              type: 'User',
              id,
            },
            context,
          ),
        )
        .forEach((sub) => subscriptions.push(sub))
    }
  }

  if (uniqueUsers) {
    // uniqueify subscriptions in regard to userId
    // first subscription has precedence (format before author)
    return subscriptions.filter(
      (sub1, index1, arr) =>
        arr.findIndex(
          (sub2, index2) => sub2.userId === sub1.userId && index2 < index1,
        ) === -1,
    )
  }
  return subscriptions
}

module.exports = {
  getSubscriptionsForDoc,
}
