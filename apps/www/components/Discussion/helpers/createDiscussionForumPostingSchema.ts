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
  upvoteCount?: number
  downvoteCount?: number
  interactionStatistic?: {
    '@type': 'InteractionCounter'
    interactionType: string
    userInteractionCount: number
  }[]
}

type DiscussionForumPostingSchema = {
  '@context': 'https://schema.org'
  '@type': 'DiscussionForumPosting'
  '@id'?: string
  headline?: string
  author?: PersonSchema
  datePublished?: string
  dateModified?: string
  text?: string
  articleBody?: string  
  url?: string
  mainEntity?: CommentSchema
  comment?: CommentSchema[]
  interactionStatistic?: {
    '@type': 'InteractionCounter'
    interactionType: string
    userInteractionCount: number
  }[]
}

/**
 * Converts a comment author to a Person schema
 */
function createPersonSchema(author: CommentFragmentType['displayAuthor']): PersonSchema {
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
 * Converts a comment tree node to a Comment schema
 */
function createCommentSchema(
  comment: CommentTreeNode,
  baseUrl?: string
): CommentSchema {
  const commentSchema: CommentSchema = {
    '@type': 'Comment',
    author: createPersonSchema(comment.displayAuthor),
    datePublished: comment.createdAt,
    text: comment.text || '',
  }

  // Add URL if we have a base URL
  if (baseUrl) {
    commentSchema.url = `${baseUrl}#${comment.id}`
  }

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
    commentSchema.comment = comment.comments.nodes.map(childComment => 
      createCommentSchema(childComment, baseUrl)
    )
  }

  return commentSchema
}

export function createDiscussionForumPostingSchema(
  discussion: DiscussionQuery['discussion']
): DiscussionForumPostingSchema | null {
  if (!discussion) {
    return null
  }
  const commentTree = makeCommentTree(discussion.comments)
  const comments = commentTree.nodes

  const schema: DiscussionForumPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
  }

  // Add ID if we have a path
  if (discussion.path) {
    schema['@id'] = `${PUBLIC_BASE_URL}${discussion.path}`
    schema.url = schema['@id']
  } else if (discussion.document?.meta?.path) {
    schema['@id'] = `${PUBLIC_BASE_URL}${discussion.document.meta.path}`
    schema.url = schema['@id']
  }

  // Add headline/title
  if (discussion.title) {
    schema.headline = discussion.title
  }

  // Add author if available
  if (discussion.displayAuthor) {
    schema.author = createPersonSchema(discussion.displayAuthor)
  }

  // Add publish date from document meta if available
  if (discussion.document?.meta?.publishDate) {
    schema.datePublished = discussion.document.meta.publishDate
  }

  // Add comments if we have them
  if (comments && comments.length > 0) {
    schema.comment = comments.map(comment => 
      createCommentSchema(comment, PUBLIC_BASE_URL)
    )
  }

  // Add interaction statistics for the discussion
  const discussionStats: DiscussionForumPostingSchema['interactionStatistic'] = []
  
  if (discussion.comments?.totalCount) {
    discussionStats.push({
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: discussion.comments.totalCount,
    })
  }

  if (discussionStats.length > 0) {
    schema.interactionStatistic = discussionStats
  }

  return schema
}

export default createDiscussionForumPostingSchema 