import { CustomDescendant, CustomElement, CustomText } from '../../custom-types'
import { Element as SlateElement } from 'slate'
import { config as elConfig } from '../../config/elements'

const renderLeaf = (leaf: CustomText): string => leaf.text

const renderAsText = (nodes: CustomDescendant[]): string =>
  nodes
    .reduce((acc: string, node: CustomDescendant) => {
      if (SlateElement.isElement(node)) {
        const { type } = node
        // add a whitespace between block nodes
        const finalChar = elConfig[type].attrs?.isInline ? '' : ' '
        return acc.concat(renderElement(node)).concat(finalChar)
      }
      return acc.concat(renderLeaf(node))
    }, '')
    .replace(/  +/g, ' ')
    .trim()

const renderElement = (element: CustomElement): string =>
  renderAsText(element.children)

export default renderAsText
