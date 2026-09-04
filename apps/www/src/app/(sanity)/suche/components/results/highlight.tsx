import { sanitizeSearchResultHTML } from '@/lib/sanitizeHTML'
import { css } from '@republik/theme/css'

const highlightStyle = css({
  '& em': {
    background: 'primary',
    color: 'white',
    fontStyle: 'inherit',
  },
})

/**
 * Renders a Typesense highlight snippet (matches wrapped in literal <em>
 * tags server-side, see typesense-adapter.js's highlight_start_tag/
 * highlight_end_tag) as sanitized, styled markup.
 */
export function Highlight({
  snippet,
  className,
}: {
  snippet: string
  className?: string
}) {
  return (
    <span
      className={className ? `${highlightStyle} ${className}` : highlightStyle}
      dangerouslySetInnerHTML={{ __html: sanitizeSearchResultHTML(snippet) }}
    />
  )
}
