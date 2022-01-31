import { CustomText, NormalizeFn } from '../../../custom-types'
import { Editor, Transforms } from 'slate'
import { getTextNode } from './tree'

// Ends are a special type of leaf nodes.
// Slate requires the first and last inline nodes to be text nodes.
// We use ends to push the content from the auto-added last node
// into the previous node, or from the first node into the next one.
export const handleEnds: NormalizeFn<CustomText> = ([node, path], editor) => {
  //console.log('***', node)
  if (!node.end || !node.text) {
    return
  }
  // console.log('HANDLE ENDS')
  // Since the end nodes are at one end of the structure,
  // only previous or next will be defined.
  // TODO: same with next (no use case atm)
  const previous = Editor.previous(editor, { at: path })
  if (previous) {
    const [nearestTextNode, nearestTextPath] = getTextNode(previous, editor)
    const text = nearestTextNode.text.concat(node.text)
    Transforms.insertText(editor, text, { at: nearestTextPath })
    Transforms.select(editor, nearestTextPath)
    Transforms.insertText(editor, '', { at: path })
  }
}
