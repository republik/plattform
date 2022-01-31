import {
  CustomEditor,
  CustomElement,
  NodeTemplate,
  NormalizeFn
} from '../../../custom-types'
import { config } from '../../elements'
import { Element as SlateElement, Text } from 'slate'
import { matchStructure } from '../helpers/structure'
import { handleEnds } from '../helpers/ends'
import { handlePlaceholders } from '../helpers/text'

const getCustomNormalizations = (
  node: SlateElement
): NormalizeFn<CustomElement>[] => {
  const elConfig = config[node.type]
  return (elConfig.normalizations || []).concat(
    matchStructure(elConfig.structure)
  )
}

export const withNormalizations = (topLevelStructure?: NodeTemplate[]) => (
  editor: CustomEditor
): CustomEditor => {
  const { normalizeNode } = editor
  editor.normalizeNode = ([node, path]) => {
    // console.log('normalize')
    // top-level normalization
    if (path.length === 0) {
      // console.log('top level')
      matchStructure(topLevelStructure)([node as CustomElement, path], editor)
    }
    // element normalization
    if (SlateElement.isElement(node)) {
      // console.log('element')
      getCustomNormalizations(node).forEach(normalizeFn =>
        normalizeFn([node, path], editor)
      )
    }
    // text normalization
    if (Text.isText(node)) {
      // console.log('text node')
      handleEnds([node, path], editor)
      handlePlaceholders([node, path], editor)
    }
    try {
      normalizeNode([node, path])
    } catch (e) {
      // Slate is rather trigger-happy with errors
      // continue regardless
      console.error(e)
    }
  }
  return editor
}
