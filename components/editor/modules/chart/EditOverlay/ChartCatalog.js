import React, { useState } from 'react'
import gql from 'graphql-tag'
import { compose, graphql } from 'react-apollo'
import { getSchema } from '../../../../Templates'
import { renderMdast } from 'mdast-react-render'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import { CloseIcon } from '@project-r/styleguide/icons'
import {
  Center,
  IconButton,
  Loader,
  useColorContext,
  useDebounce,
  Field
} from '@project-r/styleguide'
import Code from 'react-icons/lib/md/code'
import Edit from 'react-icons/lib/md/edit'
import Public from 'react-icons/lib/md/public'
import { css } from 'glamor'
import TypeSelector from './TypeSelector'
import { FRONTEND_BASE_URL } from '../../../../../lib/settings'

const DEFAULT_FILTERS = [
  { key: 'type', value: 'DocumentZone' },
  { key: 'documentZoneIdentifier', value: 'CHART' }
]

const getZones = gql`
  query getZones($filters: [SearchGenericFilterInput!], $search: String) {
    search(
      first: 10
      sort: { key: publishedAt, direction: DESC }
      filters: $filters
      search: $search
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
              repoId
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

const resetSize = node => ({ ...node, data: { ...node.data, size: undefined } })

const RenderChart = ({ node }) => {
  const schema = getSchema('article')
  const fullMdast = {
    type: 'root',
    children: [
      {
        data: {},
        identifier: 'CENTER',
        type: 'zone',
        children: [resetSize(node)]
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
            href={`${FRONTEND_BASE_URL}${chart.entity.document.meta.path}`}
            target='_blank'
            label='Beitrag'
            size={16}
          />
          <IconButton
            Icon={Edit}
            href={`/repo/${chart.entity.document.repoId}/edit`}
            target='_blank'
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

const Results = compose(graphql(getZones))(
  ({ data: { loading, error, search } }) => (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        if (!search) {
          return null
        }
        return (
          <>
            {search.nodes.map((chart, i) => (
              <ChartContainer key={i} chart={chart} />
            ))}
          </>
        )
      }}
    />
  )
)

const ChartCatalog = () => {
  const [colorScheme] = useColorContext()
  const [selectedType, selectType] = useState(undefined)
  const [searchText, setSearchText] = useState('')
  const [slowSearchText] = useDebounce(searchText, 200)

  const filters = DEFAULT_FILTERS.concat(
    selectedType && [{ key: 'documentZoneDataType', value: selectedType }]
  ).filter(Boolean)
  return (
    <>
      <Center>
        <Field
          label='Suche'
          value={searchText}
          onChange={(_, value) => {
            setSearchText(value)
          }}
          icon={
            searchText && (
              <CloseIcon
                style={{ cursor: 'pointer' }}
                size={30}
                onClick={() => setSearchText('')}
                {...colorScheme.set('fill', 'text')}
              />
            )
          }
        />
        <TypeSelector selected={selectedType} select={selectType} />
      </Center>
      <Results filters={filters} search={slowSearchText} />
    </>
  )
}

export default ChartCatalog
