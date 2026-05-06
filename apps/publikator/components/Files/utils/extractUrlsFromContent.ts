import visit from 'unist-util-visit'
import type { Node } from 'unist'

interface MetaUrlField {
  key: string
  label: string
}

interface UrlInfo {
  url: string
  type: 'meta' | 'link' | 'image' | 'embed'
  text: string
}

interface ContentMeta {
  [key: string]: unknown
}

interface MdastContent extends Node {
  meta?: ContentMeta
  children?: MdastContent[]
  url?: string
  alt?: string
  title?: string
  value?: string
  data?: {
    url?: string
    [key: string]: unknown
  }
  identifier?: string
}

interface RepoFile {
  url: string
  [key: string]: unknown
}

/**
 * Metadata fields that may contain unpublished file URLs
 */
const META_URL_FIELDS: MetaUrlField[] = [{ key: 'audioSourceMp3', label: 'Audio' }]

/**
 * Extract all URLs from MDAST content that could reference uploaded files.
 * This includes links, images, metadata fields (audio, cover image), and other embedded content.
 */
const extractUrlsFromContent = (content: MdastContent | null | undefined): UrlInfo[] => {
  if (!content) return []

  const urls: UrlInfo[] = []

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
  visit(content, 'link', (node: MdastContent) => {
    if (node?.url) {
      urls.push({
        url: node.url,
        type: 'link',
        text: getNodeText(node),
      })
    }
  })

  // Visit all image nodes
  visit(content, 'image', (node: MdastContent) => {
    if (node?.url) {
      urls.push({
        url: node.url,
        type: 'image',
        text: node.alt || node.title || 'Bild',
      })
    }
  })

  // Visit zone nodes (embeds, etc.) that may have URLs in their data
  visit(content, 'zone', (node: MdastContent) => {
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
const getNodeText = (node: MdastContent | null | undefined): string => {
  if (!node) return ''
  if (typeof node.value === 'string') return node.value
  if (Array.isArray(node.children)) {
    return node.children.map(getNodeText).join('')
  }
  return ''
}

/**
 * Normalize a URL for comparison by removing query parameters and trailing slashes
 */
const normalizeUrl = (url: string | null | undefined): string => {
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
 */
const urlsMatch = (url1: string | null | undefined, url2: string | null | undefined): boolean => {
  if (!url1 || !url2) return false
  const norm1 = normalizeUrl(url1)
  const norm2 = normalizeUrl(url2)
  return norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)
}

export type FileUsageMap = Map<string, UrlInfo[]>

/**
 * Check which files are being used in the document content.
 * Returns a Map of file URLs to their usage contexts.
 */
export const getFileUsageInContent = (
  files: RepoFile[] | null | undefined,
  content: MdastContent | null | undefined
): FileUsageMap => {
  const contentUrls = extractUrlsFromContent(content)
  const fileUsage: FileUsageMap = new Map()

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
