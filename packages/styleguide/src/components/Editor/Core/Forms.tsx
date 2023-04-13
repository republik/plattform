import React, {
  createContext,
  useContext,
  ReactElement,
  useMemo,
  useState,
} from 'react'
import { Editor, Transforms, Element as SlateElement, NodeEntry } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { ascending } from 'd3-array'

import { Overlay, OverlayBody, OverlayToolbar } from '../../Overlay'

import { formStyles } from '../Forms/layout'
import { useRenderContext } from '../Render/Context'
import { config as elConfig } from '../config/elements'
import { CustomEditor, CustomElement, ElementFormProps } from '../custom-types'

import { isEmptyTextNode } from './helpers/text'
import { isDescendant, selectNode } from './helpers/tree'

const FormContext = createContext([])

export const useFormContext = () => useContext(FormContext)

export const FormContextProvider = ({ children }) => {
  const [formPath, setFormPath] = useState<number[]>()
  const value = useMemo(() => [formPath, setFormPath], [formPath])
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

type FormData = {
  Form: React.FC<ElementFormProps<CustomElement>>
  node: NodeEntry<CustomElement>
}

const getForm = (
  editor: CustomEditor,
  node: NodeEntry<CustomElement>,
  skipBlock?: boolean,
): FormData | undefined => {
  const element = node[0]
  // console.log({ element, config: elConfig[element.type] })
  const config = elConfig[element.type]
  if (skipBlock && config.attrs?.blockUi) return
  const Form = config.Form
  if (!Form) return
  return {
    node,
    Form,
  }
}

const getRootFormNode = (
  editor: CustomEditor,
  selectedPath: number[],
): NodeEntry<CustomElement> => {
  let rootNode = Editor.node(editor, selectedPath) as NodeEntry<CustomElement>
  let parent = Editor.parent(editor, rootNode[1])
  while (
    !elConfig[rootNode[0].type].attrs?.stopFormIteration &&
    SlateElement.isElement(parent[0]) &&
    !elConfig[parent[0].type].attrs?.stopFormIteration
  ) {
    rootNode = parent as NodeEntry<CustomElement>
    parent = Editor.parent(editor, rootNode[1])
  }
  return rootNode
}

const getDescendantForms = (
  editor: CustomEditor,
  rootNode: NodeEntry<CustomElement>,
): FormData[] => {
  let forms: FormData[] = []
  for (const [n, p] of Editor.nodes(editor, {
    at: rootNode[1],
  })) {
    if (SlateElement.isElement(n) && isDescendant(rootNode, [n, p])) {
      const stop = elConfig[n.type].attrs?.stopFormIteration
      const isTopLevel = p.length === rootNode[1].length
      if (stop && !isTopLevel) break
      const currentForm = getForm(editor, [n, p])
      forms = forms.concat(currentForm)
      if (stop) break
    }
  }
  return forms
}

const getOverlappingForm = (
  editor: CustomEditor,
  rootForm?: FormData,
): FormData => {
  if (!rootForm) return
  const topLevelNode = rootForm.node
  if (!elConfig[topLevelNode[0].type]?.attrs?.isInline) return
  const [n, p] = Editor.parent(editor, topLevelNode[1])
  if (
    SlateElement.isElement(n) &&
    Editor.isInline(editor, n) &&
    n.children.length === 3 &&
    isEmptyTextNode(n.children[0]) &&
    isEmptyTextNode(n.children[2])
  ) {
    return getForm(editor, [n, p])
  }
}

// this function has to be able to handle various cases:
// 1) forms for structured elements. E.g. for pictures, the image form should also come up
//    when clicking on the caption, when if the form is located on a sibling branch. We
//    also want that the various forms always show up in the same order (e.g. #1 picture size,
//    #2 image upload) regardless where the writer clicked (top-level picture, image, or caption)
// 2) nested inlines. E.g. a link overlapping fully with a memo. We want to bring up both forms
//
// To handle 1) we start by going as far as specified in the config (until we bump into
// an element with stopIteration flag set to true). Then we go down the tree from the root
// node recontruct our array of forms, always in the same order.
//
// To handle 2) we check whether the top level form element is:
//  - inline
//  - has inline ancestor
//  - has inline ancestor which only contains one non-empty element
export const getForms = (editor: CustomEditor, path: number[]): FormData[] => {
  if (!path || path.length === 0) return []

  const rootNode = getRootFormNode(editor, path)
  let forms = getDescendantForms(editor, rootNode)
  forms = forms.concat(getOverlappingForm(editor, forms[0]))

  return forms
    .filter(Boolean)
    .sort((a, b) => ascending(a.node[0].type, b.node[0].type))
}

const ElementForm: React.FC<FormData & { onClose: () => void }> = ({
  node,
  Form,
  onClose,
}) => {
  const editor = useSlate()
  const nodeEntry = Editor.node(editor, node[1])
  const element = nodeEntry[0] as CustomElement
  return (
    <div {...formStyles.section}>
      <Form
        element={element}
        path={nodeEntry[1]}
        onChange={(newProperties: Partial<CustomElement>) => {
          Transforms.setNodes(editor, newProperties, {
            at: node[1],
          })
        }}
        onClose={onClose}
      />
    </div>
  )
}

export const FormOverlay = (): ReactElement => {
  const { t } = useRenderContext()
  const [formPath, setFormPath] = useFormContext()
  const editor = useSlate()
  const forms = useMemo(() => getForms(editor, formPath), [editor, formPath])

  if (!forms.length || !formPath) return null

  const onClose = () => {
    const previousPath = formPath
    setFormPath(undefined)
    ReactEditor.focus(editor)
    selectNode(editor, previousPath)
  }

  return (
    <Overlay onClose={onClose} mUpStyle={{ minHeight: 0 }}>
      <OverlayToolbar
        title={t(`editor/element/${forms[0].node[0].type}`)}
        onClose={onClose}
      />
      <OverlayBody>
        {forms.map((formData, i) => (
          <ElementForm {...formData} onClose={onClose} key={i} />
        ))}
      </OverlayBody>
    </Overlay>
  )
}
