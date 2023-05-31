import { parse, format } from 'url'

export const matchType = (type) => (node) => node.type === type
export const matchHeading = (depth) => (node) =>
  node.type === 'heading' && node.depth === depth
export const matchZone = (identifier) => (node) =>
  node.type === 'zone' && node.identifier === identifier
export const matchParagraph = matchType('paragraph')
export const matchImage = matchType('image')
export const matchImageParagraph = (node) =>
  matchParagraph(node) &&
  node.children.length === 1 &&
  matchImage(node.children[0])

export const imageSizeInfo = (url) => {
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

export const imageResizeUrl = (url, size) => {
  if (!url) {
    return url
  }

  const urlObject = parse(url, true)
  if (urlObject.protocol === 'data:') {
    return url
  }

  urlObject.query.resize = size
  // ensure format calculates from query object
  urlObject.search = undefined

  return format(urlObject)
}
