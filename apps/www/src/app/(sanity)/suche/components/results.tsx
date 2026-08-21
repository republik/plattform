'use client'

import { Fragment } from 'react'
import { css } from '@republik/theme/css'

import { Spinner } from '@/app/components/ui/spinner'
import { useTranslation } from '@/lib/withT'
import { countFormat } from '@/lib/utils/format'
import { DocumentResult } from './results/document-result'
import { ProfileResult } from './results/profile-result'
import { CommentResult } from './results/comment-result'

// The Audio tab reads the same `articles` collection through the same
// buildDocumentEntity as the Document tab (see typesense-adapter.js), so
// every entity here is one of these three kinds -- never literally 'Audio'.
const RESULT_COMPONENTS = {
  Document: DocumentResult,
  User: ProfileResult,
  Comment: CommentResult,
}

const PROP_NAME = {
  Document: 'document',
  User: 'profile',
  Comment: 'comment',
}

// Results are border-top-only (see document-result.tsx etc.) -- the line
// between two results is the *next* one's top border. Nothing follows the
// last result to draw a line before this footer, so it needs its own.
const footerStyle = css({
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  display: 'flex',
  justifyContent: 'space-between',
  py: 4,
  fontSize: 14,
  md: { fontSize: 16 },
})

function ResultsFooter({ search, fetchMore }) {
  const { t } = useTranslation()
  const { nodes, totalCount, pageInfo } = search
  return (
    <div className={footerStyle}>
      {nodes.length === totalCount
        ? t.pluralize('search/pageInfo/total', {
            count: countFormat(totalCount),
          })
        : t('search/pageInfo/loadedTotal', {
            loaded: countFormat(nodes.length),
            total: countFormat(totalCount),
          })}
      {pageInfo.hasNextPage && (
        <button
          type='button'
          className={css({ color: 'primary', cursor: 'pointer' })}
          onClick={fetchMore}
        >
          {t('search/pageInfo/loadMore')}
        </button>
      )}
    </div>
  )
}

export function Results({ search, loading, error, fetchMore }) {
  if (loading || (search && search.totalCount === 0)) {
    return (
      <div className={css({ display: 'flex', justifyContent: 'center', py: 10 })}>
        <Spinner size='large' />
      </div>
    )
  }

  if (error) {
    return <div className={css({ color: 'error', py: 4 })}>{String(error)}</div>
  }

  if (!search) return null

  return (
    <div className={css({ pt: 2 })}>
      {search.nodes.map((node) => {
        const Component = RESULT_COMPONENTS[node.kind]
        if (!Component) return null
        return (
          <Fragment key={node.id}>
            <Component {...{ [PROP_NAME[node.kind]]: node }} />
          </Fragment>
        )
      })}
      <ResultsFooter search={search} fetchMore={fetchMore} />
    </div>
  )
}
