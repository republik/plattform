import { SearchDiscussionsDocument } from '#graphql/republik-api/__generated__/gql/graphql'

/**
 * Comment counts are live Postgres data (discussions.comments.totalCount) --
 * Typesense only carries the static discussionId join key (see
 * TypesenseArticleDocument#discussionId). This batches all of a page's
 * discussions into one `discussionsByIds` request (which resolves via the
 * Discussion.byId DataLoader, so it's one SQL query too) and merges
 * { ownDiscussion } into each node's meta.
 *
 * The join is on discussionId rather than repoId on purpose: repoIds disappear
 * once documents live only in Sanity, discussionIds do not.
 */
export const addOwnDiscussions = async (apolloClient, nodes) => {
  const ids = [
    ...new Set(nodes.map((node) => node.entity.discussionId).filter(Boolean)),
  ]

  if (ids.length === 0) {
    return nodes
  }

  const { data } = await apolloClient.query({
    query: SearchDiscussionsDocument,
    variables: { ids },
    fetchPolicy: 'network-only',
  })

  const discussionById = new Map(
    (data?.discussionsByIds || [])
      .filter(Boolean)
      .map((discussion) => [discussion.id, discussion]),
  )

  return nodes.map((node) => {
    const ownDiscussion = discussionById.get(node.entity.discussionId)
    if (!ownDiscussion) {
      return node
    }
    return {
      ...node,
      entity: {
        ...node.entity,
        meta: { ...node.entity.meta, ownDiscussion },
      },
    }
  })
}
