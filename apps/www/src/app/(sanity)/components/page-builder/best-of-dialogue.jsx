'use client'

import CommentLink from '@/components/Discussion/shared/CommentLink'
import DiscussionLink from '@/components/Discussion/shared/DiscussionLink'
import { useTranslation } from '@/lib/withT'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import {
  Loader,
  RootColorVariables,
  TeaserActiveDebates,
  TeaserSectionTitle,
} from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import React from 'react'

const teaserData = {
  config: {
    options: ({ lastDays = 3, first = 4, featured = 1 }) => ({
      variables: {
        lastDays: +lastDays,
        first: +first,
        featured: +featured,
      },
      ssr: false,
    }),
    props: ({ data, ownProps: { first = 4 } }) => {
      let discussions
      if (!data.loading && !data.error) {
        discussions = data.activeDiscussions.map((a) => a.discussion)

        data.featured.nodes.forEach((featuredComment) => {
          const highlightComment = {
            ...featuredComment,
            highlight: featuredComment.featuredText,
            discussion: undefined,
          }
          // ensure first discussion is the one with the highlight
          let highlightDiscussion = discussions.find(
            (d) => d.id === featuredComment.discussion.id,
          )
          if (highlightDiscussion) {
            discussions.splice(discussions.indexOf(highlightDiscussion), 1)
          } else {
            highlightDiscussion = featuredComment.discussion
          }
          discussions.unshift({
            ...highlightDiscussion,
            comments: {
              totalCount: highlightDiscussion.comments.totalCount,
              nodes: [highlightComment].concat(
                highlightDiscussion.comments.nodes || [],
              ),
            },
          })
        })

        const seenNames = new Set()
        let remainingComments = +first + data.featured.nodes.length

        discussions = discussions.reduce((all, discussion, i) => {
          let remainingCommentsPerDiscussion = i === 0 ? 2 : 1
          // get comments from never before seen names
          // - max 5 in total
          // - max 2 for first discussion, max 1 for the rest
          const nodes = discussion.comments.nodes.filter((comment) => {
            if (
              !comment.published ||
              (!comment.preview && !comment.highlight) ||
              !remainingComments ||
              !remainingCommentsPerDiscussion ||
              seenNames.has(comment.displayAuthor.name)
            ) {
              return false
            }
            seenNames.add(comment.displayAuthor.name)
            remainingComments -= 1
            remainingCommentsPerDiscussion -= 1
            return true
          })

          if (nodes.length) {
            all.push({
              ...discussion,
              comments: {
                ...discussion.comments,
                nodes,
              },
            })
          }

          return all
        }, [])
      }
      return {
        data: {
          loading: data.loading,
          error: data.error,
          discussions,
        },
      }
    },
  },
  query: `
query getFrontDiscussions($lastDays: Int!, $first: Int!, $featured: Int!) {
  featured: comments(orderBy: FEATURED_AT, orderDirection: DESC, first: $featured, featured: true) {
    id
    nodes {
      id
      published
      displayAuthor {
        id
        ...AuthorMetaData
      }
      featuredText
      createdAt
      updatedAt
      discussion {
        id
        ...DiscussionMetaData
        comments(first: 0) {
          totalCount
        }
      }
    }
  }
  activeDiscussions(lastDays: $lastDays, first: $first) {
    discussion {
      id
      ...DiscussionMetaData
      comments(first: 3, orderBy: DATE, orderDirection: DESC) {
        totalCount
        nodes {
          id
          published
          preview(length: 240) {
            string
            more
          }
          displayAuthor {
            id
            ...AuthorMetaData
          }
          createdAt
          updatedAt
        }
      }
    }
  }
}

fragment AuthorMetaData on DisplayUser {
  id
  name
  slug
  credential {
    description
    verified
  }
  profilePicture
}

fragment DiscussionMetaData on Discussion {
  id
  title
  path
  closed
  document {
    id
    meta {
      title
      path
      template
      ownDiscussion {
        id
        path
        closed
      }
    }
  }
}
  `,
}

const witBestOfDialogueData = graphql(
  gql`
    ${teaserData.query}
  `,
  teaserData.config,
)

export const BestOfDialogue = witBestOfDialogueData(({ data }) => {
  const { t } = useTranslation()
  return (
    <>
      <RootColorVariables />
      <Loader
        error={data.error}
        loading={data.loading}
        style={{ minHeight: 300 }}
        render={() => {
          return (
            <div
              className={css({
                py: 10,
                up: {
                  py: 55,
                },
              })}
            >
              <TeaserActiveDebates
                t={t}
                CommentLink={CommentLink}
                DiscussionLink={DiscussionLink}
                discussions={data.discussions}
              >
                <TeaserSectionTitle href='/dialog'>Dialog</TeaserSectionTitle>
              </TeaserActiveDebates>
            </div>
          )
        }}
      />
    </>
  )
})
