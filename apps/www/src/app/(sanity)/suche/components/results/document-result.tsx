import { Fragment } from 'react'
import Link from 'next/link'
import { css, cx } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'

import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserActions } from '@/app/(sanity)/components/teaser/feed/teaser-actions'
import { getHighlight } from '../../lib/typesense-adapter'
import { formatExcerpt, timeFormat } from '@/lib/utils/format'
import { Highlight } from './highlight'

const formatDate = timeFormat('%d.%m.%Y')

// doc.credits is a JSON-encoded CreditsNode[] (see republik/studio's
// shared/search/bylineToCredits.ts) -- internalLink spans are already
// resolved to `/~slug` profile links server-side, so rendering is just a
// plain text-or-link walk, no portable-text machinery needed.
function Credits({ credits }: { credits: unknown }) {
  if (!Array.isArray(credits)) return null
  return (
    <>
      {credits.map((node, index) =>
        node?.href ? (
          <Link key={index} href={node.href}>
            {node.value}
          </Link>
        ) : (
          <Fragment key={index}>{node?.value}</Fragment>
        ),
      )}
    </>
  )
}

export function DocumentResult({ document }) {
  const titleSnippet = getHighlight(document.highlights, 'title')
  const descSnippet = getHighlight(document.highlights, 'description')
  const authorSnippet = getHighlight(document.highlights, 'authors')
  const bodySnippet = getHighlight(document.highlights, 'plainTextBody')

  // A title/author match is a stronger signal than a description match,
  // which in turn outranks showing a body excerpt -- only the single most
  // relevant highlight is shown per result.
  const showDescription = !titleSnippet && !authorSnippet
  const showBodyExcerpt = showDescription && !descSnippet

  return (
    <div
      className={cx(
        typography,
        css({
          pb: 6,
          mb: 6,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <div
        className={css({ display: 'flex', flexDirection: 'column', gap: 2 })}
      >
        {document.format && (
          <h5 style={{ color: document.format.color || undefined }}>
            {document.format.title}
          </h5>
        )}
        <h4>
          <Link href={document.path} className={linkOverlay()}>
            {titleSnippet ? (
              <Highlight snippet={titleSnippet} />
            ) : (
              document.title
            )}
          </Link>
        </h4>
        {showDescription && document.description && (
          <p className='description'>
            {descSnippet ? (
              <Highlight snippet={descSnippet} />
            ) : (
              document.description
            )}
          </p>
        )}
        {showBodyExcerpt && bodySnippet && (
          <p className='description'>
            <Highlight snippet={formatExcerpt(bodySnippet)} />
          </p>
        )}
        {document.credits ? (
          // credits is derived from the byline, which already follows the
          // «von [Name], [date]» convention (see bylineToCredits.ts) -- it
          // already ends with the publish date, so don't append it again.
          <p className='byline'>
            <Credits credits={document.credits} />
          </p>
        ) : (
          document.publishDate && (
            <p className='byline'>
              {formatDate(new Date(document.publishDate))}
            </p>
          )
        )}
      </div>
      <TeaserActions teaser={document.teaserActionsItem} />
    </div>
  )
}
