import { PgTable } from 'pogi'
import { v4 } from 'is-uuid'

import createDataLoader from '@orbiting/backend-modules-dataloader'
import { GraphqlContext } from '@orbiting/backend-modules-types'

interface Comment {
  id: string
  discussionId: string
  parentIds?: string[]
  userId?: string
  content?: string
  upVotes: number
  downVotes: number
  votes: CommentVote[]
  hotness: number
  depth: 0
  published: boolean
  adminUnpublished: boolean
  reports?: CommentReport[]
  createdAt?: Date
  updatedAt?: Date
  tags?: string[]
  featuredAt?: Date
  featuredContent?: string
  featuredTargets?: string[]
}

interface CommentVote {
  vote: 1 | -1
  userId?: string
}

interface CommentReport {
  userId: string
  reportedAt: Date
}

export default module.exports = function (context: GraphqlContext) {
  const comments: PgTable<Comment> = context.pgdb.public.comments

  return {
    byId: createDataLoader(async (ids: readonly string[]) => {
      const commentIds = ids.filter(v4)

      return (
        (commentIds.length && (await comments.find({ id: commentIds }))) || []
      )
    }),
    byParentId: createDataLoader(
      async (parentIds: readonly string[]) => {
        const or = parentIds.filter(v4).map((p) => ({ 'parentIds @>': [p] }))
        return comments.find({ or })
      },
      null,
      (key, rows) => rows.filter((row) => row.parentIds?.includes(key)),
    ),
  }
}
