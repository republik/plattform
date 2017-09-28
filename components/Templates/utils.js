export const matchType = type => node => node.type === type
export const matchHeading = depth => node => (
  node.type === 'heading' && node.depth === depth
)
export const matchZone = identifier => node => (
  node.type === 'zone' && node.identifier === identifier
)
export const matchParagraph = matchType('paragraph')
export const matchImage = matchType('image')
export const matchImageParagraph = node => (
  matchParagraph(node) &&
  node.children.length === 1 &&
  matchImage(node.children[0])
)
