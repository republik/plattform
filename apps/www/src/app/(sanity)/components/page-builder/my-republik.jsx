'use client'

import { HrefLink } from '@/app/(sanity)/components/page-builder/_shared/live-teasers-helpers'
import { gql } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import { Loader, TeaserMyMagazine } from '@project-r/styleguide'
import React from 'react'

const teaserData = {
  config: {
    options: ({ first = 2 }) => ({
      variables: {
        first: +first,
      },
      ssr: false,
    }),
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          latestSubscribedArticles: data.notifications?.nodes
            .map((i) => i.object)
            .filter(Boolean),
          latestProgressOrBookmarkedArticles: data.me?.bookmarkAndProgress.nodes
            .map((i) => i.document)
            .filter(Boolean),
        },
      }
    },
  },
  query: `
    query getMyMagazineDocuments {
      notifications(first: 2, filter: Document, lastDays: 30) {
        nodes {
          id
          object {
            ... on Document {
              id
              meta {
                title
                emailSubject
                credits
                prepublication
                path
                kind
                template
                color
                publishDate
                format {
                  id
                  meta {
                    path
                    title
                    color
                    kind
                  }
                }
              }
            }
          }
        }
      }
      me {
        id
        bookmarkAndProgress: collectionItems(names: ["progress", "bookmarks"], first: 2, progress: UNFINISHED, uniqueDocuments: true, lastDays: 30) {
          nodes {
            id
            document {
              id
              meta {
                publishDate
                title
                path
                template
                kind
                color
                credits
                estimatedConsumptionMinutes
                estimatedReadingMinutes
                format {
                  id
                  meta {
                    path
                    title
                    color
                    kind
                  }
                }
              }
              userBookmark: userCollectionItem(collectionName: "bookmarks") {
                id
                createdAt
              }
            }
          }
        }
      }
    }
  `,
}

const withMyMagazineData = graphql(
  gql`
    ${teaserData.query}
  `,
  teaserData.config,
)

export const MyRepublik = withMyMagazineData(({ data }) => {
  return (
    <Loader
      error={null /* ignore error */}
      loading={data.loading}
      style={{ minHeight: 210 }}
      render={() => {
        return (
          <TeaserMyMagazine
            latestSubscribedArticles={data.latestSubscribedArticles}
            latestProgressOrBookmarkedArticles={
              data.latestProgressOrBookmarkedArticles
            }
            bookmarksLabel='Weiterlesen'
            bookmarksUrl='/lesezeichen'
            notificationsLabel='Abonnierte Beiträge'
            notificationsUrl='/benachrichtigungen'
            Link={HrefLink}
            ActionBar={() => null}
          />
        )
      }}
    />
  )
})
