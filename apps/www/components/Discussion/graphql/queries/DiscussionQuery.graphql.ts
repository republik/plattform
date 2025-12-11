import { gql } from '@apollo/client'
import {
  DISCUSSION_FRAGMENT,
  DiscussionFragmentType,
} from '../fragments/DiscussionFragment.graphql'
import { makeQueryHook } from '../../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  COMMENT_FRAGMENT,
  CommentFragmentType,
} from '../fragments/CommentFragment.graphql'
import Nullable from '../../../../lib/types/Nullable'

// Variables for the discussion query
export type DiscussionQueryVariables = {
  discussionPath: string
  parentId?: string
  after?: string
  orderBy: string
  depth: number
  focusId?: string
  includeParent?: boolean
  activeTag?: string
}

type DiscussionOrder =
  | 'AUTO'
  | 'DATE'
  | 'VOTES'
  | 'HOT'
  | 'REPLIES'
  | 'FEATURED_AT'

// Data returned by the discussion query
export type DiscussionQuery = {
  me: Nullable<{
    id: string
    name: Nullable<string>
    portrait: Nullable<string>
  }>
  discussion: DiscussionFragmentType & {
    allComments: {
      totalCount: {
        totalCount: number
      }
    }
    comments: {
      totalCount: number
      resolvedOrderBy: Nullable<DiscussionOrder>
      directTotalCount: Nullable<number>
      pageInfo: Nullable<{
        endCursor: Nullable<string>
        hasNextPage: Nullable<boolean>
      }>
      focus: Nullable<{
        id: string
        parentIds: string[]
        preview: Nullable<{
          string: string
          more: boolean
        }>
        displayAuthor: {
          id: string
          name: string
        }
      }>
      nodes: (CommentFragmentType & {
        comments: {
          totalCount: number
          directTotalCount: Nullable<number>
          pageInfo: Nullable<{
            endCursor: Nullable<string>
            hasNextPage: Nullable<boolean>
          }>
        }
      })[]
    }
  }
}

export const DISCUSSION_QUERY = gql`
  query discussion(
    $discussionPath: String
    $parentId: ID
    $after: String
    $orderBy: DiscussionOrder!
    $depth: Int!
    $focusId: ID
    $includeParent: Boolean
    $activeTag: String
  ) {
    me {
      id
      name
      portrait
    }
    discussion(path: $discussionPath) {
      ...Discussion
      allComments: comments(
        parentId: $parentId
        after: $after
        orderBy: $orderBy
        first: 100
        flatDepth: $depth
        focusId: $focusId
        includeParent: $includeParent
      ) {
        totalCount
      }
      comments(
        parentId: $parentId
        after: $after
        orderBy: $orderBy
        first: 100
        flatDepth: $depth
        focusId: $focusId
        includeParent: $includeParent
        tag: $activeTag
      ) {
        totalCount
        resolvedOrderBy
        directTotalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        focus {
          id
          parentIds
          preview(length: 300) {
            string
          }
          displayAuthor {
            id
            name
          }
        }
        nodes {
          ...Comment
          comments {
            totalCount
            directTotalCount
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
  ${DISCUSSION_FRAGMENT}
  ${COMMENT_FRAGMENT}
`

export const useDiscussionQuery = makeQueryHook<
  DiscussionQuery,
  DiscussionQueryVariables
>(DISCUSSION_QUERY)
