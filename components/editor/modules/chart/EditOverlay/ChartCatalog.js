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
    position: 'absolute',
    right: 0,
    top: 15,
    '& button': {
      padding: '7px 0'
    }
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
    <Center style={{ marginTop: -40 }}>
      <JSONEditor label='Einstellungen' config={config} readOnly />
      <PlainEditor label='CSV Daten' value={values} linesShown={10} readOnly />
    </Center>
  )
}

const ChartContainer = ({ chart }) => {
  const [showCode, setShowCode] = useState(false)

  const node = JSON.parse(JSON.stringify(chart.entity.node))
  return (
    <div {...styles.container}>
      <div {...styles.actions}>
        <IconButton
          Icon={Public}
          onClick={() => undefined}
          title='Zur Republik Beitrag'
          size={16}
        />
        <IconButton
          Icon={Edit}
          onClick={() => undefined}
          title='Zur Publikator Dokument'
          size={16}
        />
        <IconButton
          Icon={Code}
          onClick={() => setShowCode(!showCode)}
          size={18}
          title={showCode ? 'Code ausblenden' : 'Code anzeigen'}
        />
      </div>
      <RenderChart node={node} />
      {showCode && (
        <ChartCode
          config={node.data}
          values={node.children.find(n => n.type === 'code')?.value}
        />
      )}
    </div>
  )
}

//const ChartCatalog = compose(graphql(getZones))(({ data }) => {
const ChartCatalog = () => {
  return chartData.data.search.nodes.map((chart, i) => (
    <ChartContainer key={i} chart={chart} />
  ))
}

export default ChartCatalog
