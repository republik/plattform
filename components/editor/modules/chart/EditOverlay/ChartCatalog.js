import React, { useState } from 'react'
import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'
import { chartData } from './data'
import { getSchema } from '../../../../Templates'
import { renderMdast } from 'mdast-react-render'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import { Center, IconButton, useColorContext } from '@project-r/styleguide'
import Code from 'react-icons/lib/md/code'
import Edit from 'react-icons/lib/md/edit'
import Public from 'react-icons/lib/md/public'
import { css } from 'glamor'

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

const styles = {
  container: css({
    position: 'relative'
  }),
  actions: css({
    display: 'flex'
  })
}

const RenderChart = ({ node }) => {
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

const ChartCode = ({ values, config }) => {
  return (
    <>
      <JSONEditor label='Einstellungen' config={config} readOnly />
      <PlainEditor label='CSV Daten' value={values} linesShown={10} readOnly />
    </>
  )
}

const ChartContainer = ({ chart }) => {
  const [showCode, setShowCode] = useState(false)

  const node = JSON.parse(JSON.stringify(chart.entity.node))
  return (
    <>
      <RenderChart node={node} />
      <Center style={{ marginTop: -30, marginBottom: 60 }}>
        <div {...styles.actions}>
          <IconButton
            Icon={Public}
            onClick={() => undefined}
            label='Beitrag'
            size={16}
          />
          <IconButton
            Icon={Edit}
            onClick={() => undefined}
            label='Dokument'
            size={16}
          />
          <IconButton
            Icon={Code}
            onClick={() => setShowCode(!showCode)}
            size={20}
            label='Code'
          />
        </div>
        {showCode && (
          <ChartCode
            config={node.data}
            values={node.children.find(n => n.type === 'code')?.value}
          />
        )}
      </Center>
    </>
  )
}

//const ChartCatalog = compose(graphql(getZones))(({ data }) => {
const ChartCatalog = () => {
  return chartData.data.search.nodes.map((chart, i) => (
    <ChartContainer key={i} chart={chart} />
  ))
}

export default ChartCatalog
