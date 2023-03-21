import { CustomEditor, CustomElement, EditorConfig } from '../../custom-types'
import { config } from '../../config/elements'
import { Element as SlateElement, Text, Transforms, Range } from 'slate'
import { fixStructure } from '../helpers/structure'
import { handleEnds } from '../helpers/ends'
import {
  removeNonTextProps,
  createLinks,
  handlePlaceholders,
  mergeTextNodes,
} from '../helpers/text'
import { resetSelection } from '../helpers/selection'
import { cleanupElement, cleanupVoids } from '../helpers/tree'

let originalSelection: Range

export const withNormalizations =
  (editorConfig: EditorConfig) =>
  (editor: CustomEditor): CustomEditor => {
    const { structure: topLevelStructure } = editorConfig
    const { normalizeNode } = editor

    editor.normalizeNode = ([node, path]) => {
      // console.log('normalize', { node, path })
      let rerun
      // top-level normalization
      if (path.length === 0) {
        // console.log('top level')
        rerun = fixStructure(topLevelStructure)(
          [node as CustomElement, path],
          editor,
        )
        if (rerun) return
      }
      // element normalization
      if (SlateElement.isElement(node)) {
        // console.log('selection:', editor.selection?.anchor.path)
        if (!originalSelection) {
          originalSelection = JSON.parse(JSON.stringify(editor.selection))
        }

        // console.log(node, node.type)
        const elConfig = config[node.type]
        if (!elConfig) {
          Transforms.unwrapNodes(editor, { at: path })
          return
        }
        rerun = fixStructure(elConfig.structure)([node, path], editor)
        if (rerun) return
        const customNormalizations = elConfig.normalizations || []
        customNormalizations.forEach((normalizeFn) => {
          rerun = normalizeFn([node, path], editor)
          if (rerun) return
        })
        rerun = cleanupVoids([node, path], editor)
        if (rerun) return

        rerun = cleanupElement([node, path], editor)
        if (rerun) return

        // if elements got replaced, try to restore previous selection
        rerun = resetSelection(originalSelection)([node, path], editor)
        originalSelection = undefined
        if (rerun) {
          return
        }
      }

      // text normalization
      if (Text.isText(node)) {
        // console.log('text node')
        rerun = createLinks([node, path], editor)
        if (rerun) return
        rerun = handleEnds([node, path], editor)
        if (rerun) return
        rerun = removeNonTextProps([node, path], editor)
        if (rerun) return
        rerun = mergeTextNodes([node, path], editor)
        if (rerun) return
        rerun = handlePlaceholders([node, path], editor)
        if (rerun) return
      }

      normalizeNode([node, path])
    }
    return editor
  }
