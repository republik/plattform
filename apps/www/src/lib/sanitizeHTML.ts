import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize a HTML string to strip all html tags except <em> for search result highlighting
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeSearchResultHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['em'],
    ALLOWED_ATTR: [],
  })
}
