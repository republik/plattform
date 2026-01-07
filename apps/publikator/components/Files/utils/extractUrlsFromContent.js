import visit from 'unist-util-visit'

/**
 * Metadata fields that may contain unpublished file URLs
 */
const META_URL_FIELDS = [{ key: 'audioSourceMp3', label: 'Audio' }]

/**
 * Extract all URLs from MDAST content that could reference uploaded files.
 * This includes links, images, metadata fields (audio, cover image), and other embedded content.
 *
 * @param {Object} content - The MDAST document content
 * @returns {Array<{url: string, type: string, text?: string}>} - Array of found URLs with their context
 */
const extractUrlsFromContent = (content) => {
  if (!content) return []

  const urls = []

  // Check metadata fields for URLs (audioSourceMp3, image, etc.)
  if (content.meta) {
    for (const { key, label } of META_URL_FIELDS) {
      const url = content.meta[key]
      if (url && typeof url === 'string') {
        urls.push({
          url,
          type: 'meta',
          text: label,
        })
      }
    }
  }

  // Visit all link nodes
  visit(content, 'link', (node) => {
    if (node?.url) {
      urls.push({
        url: node.url,
        type: 'link',
        text: getNodeText(node),
      })
    }
  })

  // Visit all image nodes
  visit(content, 'image', (node) => {
    if (node?.url) {
      urls.push({
        url: node.url,
        type: 'image',
        text: node.alt || node.title || 'Bild',
      })
    }
  })

  // Visit zone nodes (embeds, etc.) that may have URLs in their data
  visit(content, 'zone', (node) => {
    if (node?.data?.url) {
      urls.push({
        url: node.data.url,
        type: 'embed',
        text: node.identifier || 'Embed',
      })
    }
  })

  return urls
}

/**
 * Get text content from a node
 */
const getNodeText = (node) => {
  if (!node) return ''
  if (typeof node.value === 'string') return node.value
  if (Array.isArray(node.children)) {
    return node.children.map(getNodeText).join('')
  }
  return ''
}

/**
 * Normalize a URL for comparison by removing query parameters and trailing slashes
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL
 */
const normalizeUrl = (url) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    // Return just the origin + pathname (without query params or hash)
    return (urlObj.origin + urlObj.pathname).replace(/\/+$/, '')
  } catch {
    // If URL parsing fails, just clean up the string
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '')
  }
}

/**
 * Check if two URLs match (comparing normalized versions)
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} - Whether the URLs match
 */
const urlsMatch = (url1, url2) => {
  if (!url1 || !url2) return false
  const norm1 = normalizeUrl(url1)
  const norm2 = normalizeUrl(url2)
  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)
}

/**
 * Check which files are being used in the document content.
 * Returns a Map of file URLs to their usage contexts.
 *
 * @param {Array} files - Array of file objects with url property
 * @param {Object} content - The MDAST document content
 * @returns {Map<string, Array<{type: string, text: string}>>} - Map of file URLs to usage contexts
 */
export const getFileUsageInContent = (files, content) => {
  const contentUrls = extractUrlsFromContent(content)
  const fileUsage = new Map()

  if (!files || !contentUrls.length) {
    return fileUsage
  }

  for (const file of files) {
    if (!file.url) continue

    // Find all places where this file URL is used
    const usages = contentUrls.filter((urlInfo) => urlsMatch(file.url, urlInfo.url))

    if (usages.length > 0) {
      fileUsage.set(file.url, usages)
    }
  }

  return fileUsage
}

export default extractUrlsFromContent

