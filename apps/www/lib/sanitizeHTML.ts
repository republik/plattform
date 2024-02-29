import DOMPurify from 'isomorphic-dompurify'

const DEFAULT_ALLOWED_HTML_TAGS = [
  'p',
  'b',
  'i',
  'u',
  'strong',
  'em',
  'small',
  'sub',
  'sup',
  'del',
  'ins',
  'mark',
  'abbr',
  'cite',
  'code',
  'dfn',
  'kbd',
  'var',
]

const ALWAYS_FORBIDDEN_HTML_TAGS = [
  'style',
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
]

/**
 * Sanitize a HTML string to only allow the tags defined in `DEFAULT_ALLOWED_HTML_TAGS`
 * and forbid the tags defined in `ALWAYS_FORBIDDEN_HTML_TAGS`
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeTextHTML(
  html: string,
): ReturnType<typeof DOMPurify.sanitize> {
  return DOMPurify.sanitize(html.toString(), {
    ALLOWED_TAGS: DEFAULT_ALLOWED_HTML_TAGS,
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize a HTML string to only allow the tags defined in `DEFAULT_ALLOWED_HTML_TAGS`
 * @param html HTML string to sanitize
 * @param config DOMPurify config
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(
  html: string,
  config?: Parameters<typeof DOMPurify.sanitize>[1],
): ReturnType<typeof DOMPurify.sanitize> {
  return DOMPurify.sanitize(html.toString(), {
    ...config,
    FORBID_TAGS: ALWAYS_FORBIDDEN_HTML_TAGS,
  })
}
