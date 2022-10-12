import { CustomDescendant, CustomElement, CustomText } from '../custom-types'
import { isSlateElement } from './helpers'

const renderLeaf = (leaf: CustomText): string => leaf.text

const renderAsText = (nodes: CustomDescendant[]): string =>
  nodes
    .reduce((acc: string, node: CustomDescendant) => {
      if (isSlateElement(node)) {
        return acc.concat(renderElement(node)).concat(' ')
      }
      return acc.concat(renderLeaf(node))
    }, '')
    .replace(/  +/g, ' ')
    .trim()

const renderElement = (element: CustomElement): string =>
  renderAsText(element.children)

export default renderAsText
