import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'
import { DiscussionQuery } from '../graphql/queries/DiscussionQuery.graphql'
import { CommentTreeNode } from './makeCommentTree'
import makeCommentTree from './makeCommentTree'
import { PUBLIC_BASE_URL } from '../../../lib/constants'

type PersonSchema = {
  '@type': 'Person'
  name: string
  url?: string
  image?: string
}

type CommentSchema = {
  '@type': 'Comment' | 'DiscussionForumPosting'
  author: PersonSchema
  datePublished: string
  dateModified?: string
  text: string
  url?: string
  comment?: CommentSchema[]
  upvoteCount?: number
  downvoteCount?: number
  interactionStatistic?: {
    '@type': 'InteractionCounter'
    interactionType: string
    userInteractionCount: number
  }[]
}

/**
 * Converts a comment author to a Person schema
 */
function createPersonSchema(
  author: CommentFragmentType['displayAuthor'],
): PersonSchema {
  const person: PersonSchema = {
    '@type': 'Person',
    name: author.name,
  }

  if (author.slug) {
    person.url = `https://republik.ch/~${author.slug}`
  }

  if (author.profilePicture) {
    person.image = author.profilePicture
  }

  return person
}

/**
 * Converts a comment tree node to a Comment or DiscussionForumPosting schema
 */
function createCommentSchema(
  comment: CommentTreeNode,
  isTopLevel = false,
): CommentSchema {
  const commentSchema: CommentSchema = {
    '@type': isTopLevel ? 'DiscussionForumPosting' : 'Comment',
    author: createPersonSchema(comment.displayAuthor),
    datePublished: comment.createdAt,
    text: comment.text || '',
  }

  commentSchema.url = `${PUBLIC_BASE_URL}#${comment.id}`

  // Add vote counts as interaction statistics
  const interactionStats: CommentSchema['interactionStatistic'] = []

  if (comment.upVotes > 0) {
    interactionStats.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/LikeAction',
      userInteractionCount: comment.upVotes,
    })
  }

  if (comment.downVotes > 0) {
    interactionStats.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/DislikeAction',
      userInteractionCount: comment.downVotes,
    })
  }

  if (interactionStats.length > 0) {
    commentSchema.interactionStatistic = interactionStats
  }

  // Add nested comments if they exist
  if (comment.comments?.nodes && comment.comments.nodes.length > 0) {
    commentSchema.comment = comment.comments.nodes.map((childComment) =>
      createCommentSchema(childComment, false),
    )
  }

  return commentSchema
}

export function createDiscussionForumPostingSchema(
  discussion: DiscussionQuery['discussion'],
): { '@context': string; '@graph': CommentSchema[] } | null {
  if (!discussion) {
    return null
  }
  const commentTree = makeCommentTree(discussion.comments)
  const comments = commentTree.nodes

  return {
    '@context': 'https://schema.org',
    '@graph': comments.map((comment) => createCommentSchema(comment, true))
  }
}

export default createDiscussionForumPostingSchema
