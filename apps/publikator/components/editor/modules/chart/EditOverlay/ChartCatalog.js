import { useEffect, useRef, useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { getSchema } from '../../../../Templates'
import { renderMdast } from '@republik/mdast-react-render'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import {
  Center,
  IconButton,
  Loader,
  useColorContext,
  useDebounce,
  Field,
  A,
  fontStyles,
  mediaQueries,
  Interaction,
} from '@project-r/styleguide'
import {
  IconCode as Code,
  IconEdit as Edit,
  IconClose,
  IconPublic as Public,
} from '@republik/icons'
import { css } from 'glamor'
import TypeSelector from './TypeSelector'
import { FRONTEND_BASE_URL } from '../../../../../lib/settings'
import scrollIntoView from 'scroll-into-view'
import ChartActions from './ChartActions'

const DEFAULT_FILTERS = [
  { key: 'type', value: 'DocumentZone' },
  { key: 'documentZoneIdentifier', value: 'CHART' },
]

const getZones = gql`
  query getZones(
    $filters: [SearchGenericFilterInput!]
    $search: String
    $before: String
    $after: String
  ) {
    search(
      first: 10
      sort: { key: publishedAt, direction: DESC }
      filters: $filters
      search: $search
      before: $before
      after: $after
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
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
    position: 'relative',
  }),
  actions: css({
    display: 'flex',
  }),
  footerAction: css({
    paddingBottom: 30,
    ...fontStyles.sansSerifRegular16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular21,
    },
  }),
}

const resetSize = (node) => ({
  ...node,
  data: { ...node.data, size: undefined },
})

const PaginationLink = ({ onClick, label, style, containerRef }) => {
  return (
    <A
      {...styles.footerAction}
      style={style}
      href='#'
      onClick={(e) => {
        e.preventDefault()
        onClick()
        scrollIntoView(containerRef.current, {
          time: 0,
          align: {
            top: 0,
          },
        })
      }}
    >
      {label}
    </A>
  )
}

const Pagination = ({
  search: {
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
  },
  fetchMore,
  containerRef,
}) => (
  <Center>
    {hasPreviousPage && (
      <PaginationLink
        style={{ float: 'left' }}
        label='Zurück'
        containerRef={containerRef}
        onClick={() => {
          fetchMore({ before: startCursor })
        }}
      />
    )}
    {hasNextPage && (
      <PaginationLink
        style={{ float: 'right' }}
        label='Weiter'
        containerRef={containerRef}
        onClick={() => {
          fetchMore({ after: endCursor })
        }}
      />
    )}
  </Center>
)

const RenderChart = ({ node }) => {
  const schema = getSchema('article')
  const fullMdast = {
    type: 'root',
    children: [
      {
        data: {},
        identifier: 'CENTER',
        type: 'zone',
        children: [resetSize(node)],
      },
    ],
    meta: {},
  }
  return <>{renderMdast(fullMdast, schema)}</>
}

const ChartCode = ({ values, config, onChartSelect }) => {
  return (
    <div style={{ marginTop: 10 }}>
      <JSONEditor label='Einstellungen' config={config} readOnly />
      <PlainEditor label='CSV Daten' value={values} linesShown={10} readOnly />
      <ChartActions config={config} values={values} onSelect={onChartSelect} />
    </div>
  )
}

const ChartContainer = ({ chart, onChartSelect }) => {
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
            values={node.children.find((n) => n.type === 'code')?.value}
            onChartSelect={onChartSelect}
          />
        )}
      </Center>
    </>
  )
}

const Results = compose(
  graphql(getZones, {
    options: () => ({
      // otherwise pagination info is cached
      fetchPolicy: 'network-only',
    }),
    props: ({ data }) => ({
      data,
      fetchMore: ({ after, before }) =>
        data.fetchMore({
          variables: {
            after,
            before,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => fetchMoreResult,
        }),
    }),
  }),
)(
  ({
    data: { loading, error, search },
    fetchMore,
    containerRef,
    onChartSelect,
  }) => (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        if (!search) {
          return null
        }
        if (!search.nodes?.length) {
          return (
            <Center>
              <Interaction.P>Keine Resultate</Interaction.P>
            </Center>
          )
        }
        return (
          <>
            {search.nodes.map((chart, i) => (
              <ChartContainer
                key={i}
                chart={chart}
                onChartSelect={onChartSelect}
              />
            ))}
            <Pagination
              search={search}
              fetchMore={fetchMore}
              containerRef={containerRef}
            />
          </>
        )
      }}
    />
  ),
)

const TextSearch = ({ setText }) => {
  const [colorScheme] = useColorContext()
  const [formText, setFormText] = useState('')
  const [debouncedText] = useDebounce(formText, 500)
  useEffect(() => {
    setText(debouncedText)
  }, [debouncedText])

  return (
    <Field
      label='Suche'
      value={formText}
      onChange={(_, value) => {
        setFormText(value)
      }}
      icon={
        formText && (
          <IconClose
            style={{ cursor: 'pointer' }}
            size={30}
            onClick={() => {
              setFormText('')
            }}
            {...colorScheme.set('fill', 'text')}
          />
        )
      }
    />
  )
}

const ChartCatalog = ({ onChartSelect }) => {
  const [selectedType, selectType] = useState(undefined)
  const [searchText, setSearchText] = useState('')
  const containerRef = useRef()

  const filters = DEFAULT_FILTERS.concat(
    selectedType && [{ key: 'documentZoneDataType', value: selectedType }],
  ).filter(Boolean)
  return (
    <div ref={containerRef}>
      <Center style={{ marginBottom: 20 }}>
        <TextSearch setText={setSearchText} />
        <TypeSelector selected={selectedType} select={selectType} />
      </Center>
      <Results
        filters={filters}
        search={searchText}
        containerRef={containerRef}
        onChartSelect={onChartSelect}
      />
    </div>
  )
}

export default ChartCatalog
