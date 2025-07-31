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
  '@type': 'Comment'
  author: PersonSchema
  datePublished: string
  text: string
  url?: string
  comment?: CommentSchema[]
  interactionStatistic?: {
    '@type': 'InteractionCounter'
    interactionType: string
    userInteractionCount: number
  }[]
}

// Converts a comment author to a Person schema
function createPersonSchema(
  author: CommentFragmentType['displayAuthor'],
): PersonSchema {
  const person: PersonSchema = {
    '@type': 'Person',
    name: author.name,
  }

  if (author.slug) {
    person.url = `${PUBLIC_BASE_URL}/~${author.slug}`
  }

  if (author.profilePicture) {
    person.image = author.profilePicture
  }

  return person
}

// Converts a comment tree node to a Comment schema
function createCommentSchema(
  comment: CommentTreeNode,
  discussionPath: string,
): CommentSchema {
  const commentSchema: CommentSchema = {
    '@type': 'Comment',
    author: createPersonSchema(comment.displayAuthor),
    datePublished: comment.createdAt,
    text: comment.text || '',
  }

  commentSchema.url = `${PUBLIC_BASE_URL}/dialog${discussionPath}?focus=${comment.id}`

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
      createCommentSchema(childComment, discussionPath),
    )
  }

  return commentSchema
}

export function createDiscussionForumPostingSchema(
  discussion: DiscussionQuery['discussion'],
): {
  '@context': string
  headline: string
  '@type': string
  url: string
  comment: CommentSchema[]
} | null {
  if (!discussion) {
    return null
  }
  const commentTree = makeCommentTree(discussion.comments)
  const comments = commentTree.nodes
  const discussionPath = discussion.path || discussion.document?.meta?.path

  return {
    '@context': 'https://schema.org',
    headline: discussion.title,
    '@type': 'DiscussionForumPosting',
    url: `${PUBLIC_BASE_URL}/dialog${discussionPath}`,
    comment: comments.map((comment) =>
      createCommentSchema(comment, discussionPath),
    ),
  }
}

export default createDiscussionForumPostingSchema
