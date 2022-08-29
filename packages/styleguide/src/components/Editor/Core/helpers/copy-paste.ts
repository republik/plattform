import { CustomDescendant, CustomEditor } from '../../custom-types'
import { Editor, Element as SlateElement, Text, Node, NodeEntry } from 'slate'
import { isDescendant } from './tree'
import { config as elConfig } from '../../config/elements'

export const getSlateFragment = (
  data: DataTransfer,
): CustomDescendant[] | undefined => {
  const slateData = data.getData('application/x-slate-fragment')
  return slateData && JSON.parse(decodeURIComponent(window.atob(slateData)))
}

export const insertSlateFragment = (
  editor: CustomEditor,
  fragment: CustomDescendant[],
): void => {
  let inlineNodes: NodeEntry<CustomDescendant>[] = []
  for (const [n, p] of Node.descendants({
    type: 'paragraph',
    children: fragment,
  })) {
    console.log({ inlineNodes })
    if (SlateElement.isElement(n) && elConfig[n.type]?.attrs?.isInline) {
      inlineNodes = inlineNodes.concat([[n, p]])
    } else if (
      Text.isText(n) &&
      !!n.text &&
      !inlineNodes.find((entry) => isDescendant(entry, [n, p]))
    ) {
      inlineNodes = inlineNodes.concat([[n, p]])
    }
  }
  Editor.insertFragment(
    editor,
    inlineNodes.map((entry) => entry[0]),
  )
}
