import validator from 'validator'

import type { SlateNode } from './NodeMapping'
import visit from './visit'

/**
 * Shorthand function to gather URLs. Finds all Slate nodes of type
 * "link", validates their href props. It returns an array of uniqe
 * URLs found in tree.
 *
 */
async function findLinkHref(children: SlateNode[]): Promise<string[]> {
  const hrefs = new Set()

  await visit(
    children,
    (child: SlateNode) => child?.type === 'link' && !!child?.href,
    ({ href }: SlateNode) => {
      const isValidUrl = validator.isURL(href, {
        require_protocol: true,
        protocols: ['http', 'https'],
      })

      isValidUrl && hrefs.add(href)
    },
  )

  return Array.from(hrefs).map((href) => '' + href)
}

module.exports = findLinkHref
