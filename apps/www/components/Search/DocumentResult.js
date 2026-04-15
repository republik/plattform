import { useMemo } from 'react'
import { TeaserFeed, useColorContext } from '@project-r/styleguide'
import ActionBar from '../ActionBar'
import Link from '../Link/Href'
import { css } from 'glamor'
import { findHighlight } from '../../lib/utils/mdast'
import withT from '../../lib/withT'
import { formatExcerpt } from '../../lib/utils/format'
import { sanitizeSearchResultHTML } from '../../lib/sanitizeHTML'

export default withT(({ t, node }) => {
  const [colorScheme] = useColorContext()
  const titleHighlight = findHighlight(node, 'meta.title')
  const descHighlight = findHighlight(node, 'meta.description')
  const authorHighlight = findHighlight(node, 'meta.authors')
  const textHighlight = findHighlight(node, 'contentString')

  const showDescHighlight = !titleHighlight && !authorHighlight && descHighlight
  const showTextHighlight =
    !titleHighlight && !authorHighlight && !descHighlight && textHighlight

  const actionBar = node.entity.meta ? (
    <ActionBar mode='feed' document={node.entity} />
  ) : null

  const highlightStyle = useMemo(
    () =>
      css({
        '& em': {
          background: colorScheme.getCSSColor('alert'),
          color: colorScheme.getCSSColor('text'),
          fontStyle: 'inherit',
        },
      }),
    [colorScheme],
  )
  return (
    <TeaserFeed
      {...node.entity.meta}
      title={
        titleHighlight ? (
          <span
            {...highlightStyle}
            {...colorScheme.set('color', 'text')}
            dangerouslySetInnerHTML={{
              __html: sanitizeSearchResultHTML(
                titleHighlight.fragments[0] ?? '',
              ),
            }}
          />
        ) : (
          node.entity.meta.shortTitle || node.entity.meta.title
        )
      }
      description={
        (showDescHighlight || !showTextHighlight) &&
        (descHighlight ? (
          <span
            {...highlightStyle}
            dangerouslySetInnerHTML={{
              __html: sanitizeSearchResultHTML(
                descHighlight.fragments[0] ?? '',
              ),
            }}
          />
        ) : (
          !node.entity.meta.shortTitle && node.entity.meta.description
        ))
      }
      highlight={
        showTextHighlight && (
          <span
            {...highlightStyle}
            dangerouslySetInnerHTML={{
              __html: formatExcerpt(
                sanitizeSearchResultHTML(textHighlight.fragments[0] ?? ''),
              ),
            }}
          />
        )
      }
      highlightLabel={t('search/excerpt')}
      kind={
        node.entity.meta.template === 'editorialNewsletter'
          ? 'meta'
          : node.entity.meta.kind
      }
      publishDate={
        node.entity.meta.template === 'format'
          ? null
          : node.entity.meta.publishDate
      }
      Link={Link}
      key={node.entity.meta.path}
      bar={actionBar}
    />
  )
})
