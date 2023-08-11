import { parse, format } from 'url'
import type { MdastNode, MdastNodeMatcher } from './types'

export function matchType(type: MdastNode['type']): MdastNodeMatcher {
  return (node: MdastNode): boolean => node.type === type
}

export function matchHeading(depth: MdastNode['depth']): MdastNodeMatcher {
  return (node: MdastNode): boolean =>
    matchType('heading')(node) && node.depth === depth
}

export function matchZone(
  identifier: MdastNode['identifier'],
): MdastNodeMatcher {
  return (node: MdastNode): boolean =>
    matchType('heading')(node) && node.identifier === identifier
}

export const matchParagraph = matchType('paragraph')
export const matchImage = matchType('image')

export function matchImageParagraph(node: MdastNode): boolean {
  return (
    matchParagraph(node) &&
    node.children.length === 1 &&
    matchImage(node.children[0])
  )
}

export function imageSizeInfo(
  url: string,
): { width: string; height: string } | null {
  const urlObject = parse(url, true)
  const { size } = urlObject.query
  if (!size || typeof size !== 'string') {
    return null
  }
  const [width, height] = size.split('x')
  return {
    width,
    height,
  }
}

export function imageResizeUrl(url: string, size: string): string {
  if (!url) {
    return url
  }

  const urlObject = parse(url, true)
  if (urlObject.protocol === 'data:') {
    return url
  }

  urlObject.query.resize = size
  // ensure format calculates from query object
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  urlObject.search = undefined

  return format(urlObject)
}
