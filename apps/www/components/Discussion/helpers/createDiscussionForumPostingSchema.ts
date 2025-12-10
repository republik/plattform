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
  '@context'?: string
  '@type': 'Comment' | 'DiscussionForumPosting'
  author: PersonSchema
  datePublished: string
  text: string
  url: string
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
  isTopLevel: boolean = false,
): CommentSchema {
  const commentSchema: CommentSchema = {
    '@context': 'https://schema.org/',
    '@type': isTopLevel ? 'DiscussionForumPosting' : 'Comment',
    author: createPersonSchema(comment.displayAuthor),
    datePublished: comment.createdAt,
    text: comment.text || '',
    url: `${PUBLIC_BASE_URL}/dialog${discussionPath}?focus=${comment.id}`,
  }

  const interactionStats: CommentSchema['interactionStatistic'] = []

  if (comment.upVotes > 0) {
    interactionStats.push({
      '@type': 'InteractionCounter',
      interactionType: 'LikeAction',
      userInteractionCount: comment.upVotes,
    })
  }

  if (comment.downVotes > 0) {
    interactionStats.push({
      '@type': 'InteractionCounter',
      interactionType: 'DislikeAction',
      userInteractionCount: comment.downVotes,
    })
  }

  if (interactionStats.length > 0) {
    commentSchema.interactionStatistic = interactionStats
  }

  // Add nested comments if they exist
  if (comment.comments?.nodes && comment.comments.nodes.length > 0) {
    commentSchema.comment = comment.comments.nodes.map((childComment) =>
      createCommentSchema(childComment, discussionPath, false),
    )
  }

  return commentSchema
}

export function createDiscussionForumPostingSchema(
  discussion: DiscussionQuery['discussion'],
): CommentSchema[] | null {
  if (!discussion) {
    return null
  }
  const commentTree = makeCommentTree(discussion.comments)
  const comments = commentTree.nodes
  const discussionPath = discussion.path || discussion.document?.meta?.path

  // Return all top-level comments as DiscussionForumPosting entries
  if (comments.length === 0) {
    return null
  }

  return comments.map((comment) =>
    createCommentSchema(comment, discussionPath, true),
  )
}

export default createDiscussionForumPostingSchema
