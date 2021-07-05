import React from 'react'
import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'

const getZones = gql`
  query getZones {
    search(
      first: 10
      sort: { key: publishedAt, direction: DESC }
      filters: [
        { key: "type", value: "DocumentZone" }
        { key: "documentZoneIdentifier", value: "CHART" }
      ]
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        entity {
          ... on DocumentZone {
            id
            data
            node
            document {
              id
              meta {
                title
                path
              }
            }
          }
        }
      }
    }
  }
`

const ChartCatalog = compose(graphql(getZones))(({ data }) => {
  console.log(data)
  return 'Chart Catalog'
})

export default ChartCatalog
