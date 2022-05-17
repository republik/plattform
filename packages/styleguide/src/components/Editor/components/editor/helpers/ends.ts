import { CustomText, NormalizeFn } from '../../../custom-types'
import { Editor, Transforms } from 'slate'
import { calculateSiblingPath, getTextNode } from './tree'

// Ends are a special type of leaf nodes.
// Slate requires the first and last inline nodes to be text nodes.
// We use ends to push the content from the auto-added last node
// into the previous node, or from the first node into the next one.
export const handleEnds: NormalizeFn<CustomText> = ([node, path], editor) => {
  //console.log('***', node)
  if (!node.end || !node.text) {
    return false
  }
  // console.log('HANDLE ENDS')
  // Since the end nodes are at one end of the structure,
  // only previous or next will be defined.
  // TODO: same with next (no use case atm)
  const previous = Editor.previous(editor, { at: path })
  if (previous) {
    const nearestTextPath = getTextNode(previous, editor)[1]
    const target = calculateSiblingPath(nearestTextPath)
    // console.log({ at: path, to: target })
    Transforms.unsetNodes(editor, 'end', { at: path })
    Transforms.moveNodes(editor, { at: path, to: target })
    return true
  }
  return false
}
