import React from 'react'
import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'
import { chartData } from './data'
import { getSchema } from '../../../../Templates'
import { renderMdast } from 'mdast-react-render'
import { stringify, parse } from '@orbiting/remark-preset'

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

export const RenderChart = ({ node }) => {
  const schema = getSchema('article')
  const fullMdast = {
    type: 'root',
    children: [
      {
        data: {},
        identifier: 'CENTER',
        type: 'zone',
        children: [node]
      }
    ],
    meta: {}
  }
  return <>{renderMdast(fullMdast, schema)}</>
}

//const ChartCatalog = compose(graphql(getZones))(({ data }) => {
const ChartCatalog = () => {
  return chartData.data.search.nodes.map((chart, i) => (
    <RenderChart key={i} node={JSON.parse(JSON.stringify(chart.entity.node))} />
  ))
}

export default ChartCatalog
