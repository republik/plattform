import CommentLink from '../Discussion/shared/CommentLink'
import { CommentTeaser, RawHtml } from '@project-r/styleguide'
import { sanitizeSearchResultHTML } from '../../lib/sanitizeHTML'

import { useTranslation } from '../../lib/withT'

export default function CommentResult({ node }) {
  const { t } = useTranslation()
  const highlightText: string =
    node.highlights?.find((h) => h.path === 'contentString')?.fragments?.[0] ??
    ''

  const highlightedSearchResult = highlightText ? (
    <>
      <RawHtml
        dangerouslySetInnerHTML={{
          __html: sanitizeSearchResultHTML(highlightText),
        }}
      />
    </>
  ) : null

  return (
    <CommentTeaser
      {...node.entity}
      context={{
        title: node.entity.discussion.title,
      }}
      highlightedSearchResult={highlightedSearchResult}
      CommentLink={CommentLink}
      t={t}
    />
  )
}
